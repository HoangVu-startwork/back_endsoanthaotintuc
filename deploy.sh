echo "Please PUSH code before call this SCRIPT"

curl -i -X POST -k \
-H "x-secret: Dicom-Interactive-is-#1" \
-H "Content-Type: application/json" \
'https://api.dicom-interactive.com/movinavir/deploy-universal-api'
echo ''
echo ''