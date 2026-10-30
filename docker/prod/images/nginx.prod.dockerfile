# syntax=docker/dockerfile:1.7
# Build from the repository root: docker build -f docker/prod/images/nginx.prod.dockerfile -t template-nginx .
#
# nginx on distroless: the binary, its musl libraries, mime.types and our config. No entrypoint
# script, no envsubst: the config is static and routes on the Host header (see nginx.conf).

ARG NGINX_VERSION=1.31.8
ARG GO_VERSION=1.26.10

FROM golang:${GO_VERSION}-alpine AS probe
WORKDIR /src
COPY docker/prod/config/probe/main.go .
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /probe main.go

FROM nginx:${NGINX_VERSION}-alpine AS nginx
# Copy the binary with every library it links, symlinks resolved.
# Distroless has a merged /usr (/lib links to /usr/lib): libraries move there, still found at /lib.
RUN mkdir -p /rootfs \
 && ldd /usr/sbin/nginx | grep -oE '/[^ ]+' | sort -u \
  | xargs tar -chf - /usr/sbin/nginx /etc/nginx/mime.types | tar -xf - -C /rootfs \
 && mkdir -p /rootfs/usr/lib && mv /rootfs/lib/* /rootfs/usr/lib/ && rmdir /rootfs/lib

FROM gcr.io/distroless/static-debian13:nonroot AS runtime
COPY --from=nginx /rootfs/ /
COPY --from=probe /probe /usr/local/bin/probe
COPY docker/prod/config/nginx/nginx.conf /etc/nginx/nginx.conf
USER 65532:65532
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD ["probe", "http://127.0.0.1:8081/healthz"]
# `-e stderr`: the compiled-in error log (/var/log/nginx) is opened before the config is read.
ENTRYPOINT ["/usr/sbin/nginx", "-e", "stderr"]
CMD ["-c", "/etc/nginx/nginx.conf"]
