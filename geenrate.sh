#!/bin/bash

# Base URL
BASE_URL="https://3000-rahulvrames-galapagosla-vy7mxnxvvfz.ws-us114.gitpod.io"

# Array of paths from the sitemap
URLS=(
  "/about"
  "/contact"
  "/course/cnet-bjrf"
  "/course/ifa-support"
  "/course/irpe-training"
  "/course/npi-phd"
  "/course"
  "/index"
  "/library"
  "/mentor/afsal"
  "/mentor/anzal"
  "/mentor/aswathi"
  "/mentor/ginto"
  "/mentor/naseef"
  "/mentor/nikhil"
  "/mentor/nithin"
  "/mentor/panchami"
  "/mentor/renjith"
  "/mentor/sabith"
  "/mentor/sreejith"
  "/mentor/vaisak"
  "/mentor/vivek"
  "/mentor/yadukrishnan"
  "/mentor"
  "/register"
)

# Loop through each URL and visit it using curl
for url in "${URLS[@]}"; do
  full_url="${BASE_URL}${url}.html"
  echo "Visiting: $full_url"
  curl -o /dev/null -s -w "%{http_code}\n" "$full_url"
done
