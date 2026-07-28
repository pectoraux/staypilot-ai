#!/bin/bash
unset DATABASE_URL DIRECT_URL
cd /home/z/my-project
exec ./node_modules/.bin/next dev -p 3000
