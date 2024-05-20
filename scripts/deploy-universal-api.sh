#!/bin/bash
#variable
api_dir="/srv/dicom-universal-api/"
echo "Run deploy script for dicom universal"
# sudo su
cd $api_dir
md5sum package.json > deploy-md5sum

# pull code
git pull
# check sum have change
if md5sum --check deploy-md5sum; then
   echo "requirements NOTHING CHANGED"
else
   echo "requirements CHANGE"
   npm install
fi

echo "RESTART..."
pm2 restart dicom-universal-api
echo "-DONE-"