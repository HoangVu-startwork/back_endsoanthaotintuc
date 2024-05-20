#!/bin/sh
web_dir="/srv/dicom-movinavir-web-test/"

# sudo su
cp /tmp/dist.zip $web_dir
cd $web_dir
mv dist dist-$(date +"%Y%m%d%T")
unzip dist.zip
rm -f dist.zip
chcon -Rt httpd_sys_content_t /srv/dicom-movinavir-web-test/dist