#!/usr/bin/env bash

docker run --name "mplanchard-blog-postgres" \
  -e "POSTGRES_PASSWORD=this-is-the-development-password" \
  -e "POSTGRES_DB=blog" \
  -e "POSTGRES_USER=mplanchard" \
  -p "127.0.0.1:5432:5432" \
  -d postgres \

rc=$?

if [[ "$rc" != 0 ]]; then
  docker start mplanchard-blog-postgres
fi
