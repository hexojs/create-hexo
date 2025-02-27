#!/usr/bin/env bash

echo -n "$(cat .git/modules/hexo-starter/refs/heads/master)" > ./hash
echo "starter version: $(cat ./hash)"