# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/cloudflared.prod.dockerfile -t template-cloudflared .
#
# Cloudflare Tunnel connector: outbound-only, so the host publishes no port at all. The upstream
# image is already distroless (base-debian13:nonroot); pinning it here gives every service the
# same build, scan and publish path. The tunnel token comes from CLOUDFLARE_TUNNEL_TOKEN.

ARG CLOUDFLARED_VERSION=2026.10.6

FROM cloudflare/cloudflared:${CLOUDFLARED_VERSION}
USER 65532:65532
# `tunnel ready` asks the metrics server (--metrics, docker-compose.prod.yaml) for /ready.
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD ["cloudflared", "tunnel", "--metrics", "127.0.0.1:20241", "ready"]
ENTRYPOINT ["cloudflared", "--no-autoupdate"]
CMD ["tunnel", "--metrics", "127.0.0.1:20241", "run"]
