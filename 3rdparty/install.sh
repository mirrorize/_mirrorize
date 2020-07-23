# You need `wget` dependency.

echo "Download 'moment.js'"
wget -O moment.js https://momentjs.com/downloads/moment-with-locales.js

echo "Download 'moment-timezone.js'"
wget -O moment-timezone.js https://momentjs.com/downloads/moment-timezone-with-data.js

echo "Install Default Fonts"
../node_modules/get-google-fonts/cli.js -i "https://fonts.googleapis.com/css?family=Roboto:400,700" -o ./ -c ./fonts.css
