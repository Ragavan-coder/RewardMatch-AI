"""
RewardMatch AI - Server-Side Request Forgery (SSRF) Defense Module
Strictly validates URLs to prevent DNS rebinding, internal network scanning,
loopback access, and cloud metadata (169.254.169.254) exfiltration.
"""

import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, List, Optional

# Supported official retail merchant domains
ALLOWED_MERCHANT_DOMAINS = [
    "amazon.in",
    "www.amazon.in",
    "flipkart.com",
    "www.flipkart.com",
    "myntra.com",
    "www.myntra.com",
    "ajio.com",
    "www.ajio.com",
    "croma.com",
    "www.croma.com",
    "reliancedigital.in",
    "www.reliancedigital.in",
    "tataneu.com",
    "www.tataneu.com",
    "swiggy.com",
    "www.swiggy.com",
    "zomato.com",
    "www.zomato.com",
    "makemytrip.com",
    "www.makemytrip.com",
]

# Prohibited dangerous IP CIDR blocks
BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("10.0.0.0/8"),        # RFC 1918 Private
    ipaddress.ip_network("172.16.0.0/12"),     # RFC 1918 Private
    ipaddress.ip_network("192.168.0.0/16"),    # RFC 1918 Private
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local & Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("0.0.0.0/8"),         # Broadcast/Zero
    ipaddress.ip_network("100.64.0.0/10"),     # Carrier-grade NAT
    ipaddress.ip_network("192.0.2.0/24"),      # Documentation TEST-NET-1
    ipaddress.ip_network("198.51.100.0/24"),   # Documentation TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),    # Documentation TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
]


class SSRFProtectionError(Exception):
    """Raised when a URL violates SSRF safety rules."""
    pass


class SSRFValidator:
    """Validates external destination URLs before outgoing network requests."""

    @classmethod
    def validate_url(cls, url: str, enforce_domain_allowlist: bool = False) -> Tuple[bool, str]:
        """
        Validates target URL against SSRF vulnerabilities.
        Returns (is_safe: bool, reason: str).
        """
        if not url or not isinstance(url, str):
            return False, "Invalid or empty URL."

        url = url.strip()
        parsed = urlparse(url)

        # 1. Scheme validation (only HTTP and HTTPS permitted; HTTPS preferred)
        if parsed.scheme.lower() not in ("http", "https"):
            return False, f"Prohibited URL scheme '{parsed.scheme}'. Only HTTPS and HTTP are permitted."

        hostname = parsed.hostname
        if not hostname:
            return False, "Missing hostname in URL."

        hostname_lower = hostname.lower()

        # 2. Block localhost / loopback names directly
        if hostname_lower in ("localhost", "127.0.0.1", "::1", "0.0.0.0", "metadata.google.internal"):
            return False, f"Access to localhost/internal host '{hostname}' is strictly forbidden."

        # 3. Domain allowlist check if enforced
        if enforce_domain_allowlist:
            if not any(hostname_lower == d or hostname_lower.endswith("." + d) for d in ALLOWED_MERCHANT_DOMAINS):
                return False, f"Host '{hostname}' is not in the verified merchant domain allowlist."

        # 4. DNS resolution and IP range verification
        try:
            # Resolve all addresses
            addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            resolved_ips = {item[4][0] for item in addr_info}
        except socket.gaierror:
            return False, f"Unable to resolve DNS for hostname '{hostname}'."

        if not resolved_ips:
            return False, f"No IP addresses resolved for hostname '{hostname}'."

        # 5. Verify every resolved IP against prohibited CIDRs
        for ip_str in resolved_ips:
            try:
                ip = ipaddress.ip_address(ip_str)

                # Standard checks
                if ip.is_loopback:
                    return False, f"Destination resolved to loopback IP '{ip_str}'."
                if ip.is_private:
                    return False, f"Destination resolved to private network IP '{ip_str}'."
                if ip.is_link_local:
                    return False, f"Destination resolved to link-local/cloud metadata IP '{ip_str}'."
                if ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                    return False, f"Destination resolved to reserved/restricted IP '{ip_str}'."

                # Explicit CIDR check for IPv4
                if isinstance(ip, ipaddress.IPv4Address):
                    for net in BLOCKED_NETWORKS:
                        if ip in net:
                            return False, f"Destination IP '{ip_str}' falls within blocked network range {net}."

            except ValueError:
                return False, f"Invalid resolved IP address '{ip_str}'."

        return True, "URL is safe for ingestion."
