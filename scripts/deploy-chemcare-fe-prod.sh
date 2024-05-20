#!/bin/sh
web_dir="/srv/dicom-chemcare-web/"

# sudo su
cp /tmp/dist.zip $web_dir
cd $web_dir
mv dist dist-$(date +"%Y%m%d%T")
unzip dist.zip
rm -f dist.zip
