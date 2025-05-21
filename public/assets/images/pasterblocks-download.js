// This is a temporary script to help download the image
// We'll use it with Node.js to download the image
const fs = require('fs');
const https = require('https');

const url = 'https://generativeusercontent.googleapis.com/v2/us-central1-as-a/us-central1/downloads:tempurl?resourceType=DOWNLOAD&ttl=172801&token=QUlEQUZ5aktkS085NzN5cFZlNnBjci1ZaGk0QVZ2SHl3UzRIUkIwQjNoaXhGMHltc21RRT1yWGFSbm1zN3o3MmpQZENkbXE1YkVnSUZfR05oQVZORFZ5SU42dFl2R0dOSnMwSHJ2bEYyZjl5S2J6WFpXNDdOMEd3LWRmUXdnNkFzWXlJbzBNWEhtdEVkQ0FLSVRVZEtzT21kUjFXUUlBZ0NuY0VpTjdxeUdCMGsycEhzWTRGUkQ0MEJwZ3VsVDJuZ2UxM0Z2ZTVBMzlQWVVoWXhSWVpKdDlOTDdsQWJWaHh0dEpHdi1RRGcyWTdBVW0zWEZLYXRobVFzS25VVkV3cVJRTldyaVA0YnhZSjZfalpuMWIyWG9YTmNQblg0alZuRE9TekhEYjYweEwzRFZmRHZHU1ZvSXc4YV9fOUJ2b3NNMGZFRUVYdHJiVC1DWVExM3gxSkVudHl6UGM1Y1ZxeTNCcUprOVlfTDBzeXU2bHFmWlZYWmRQRW40Y2lTZHFkRF83VXZvbVI1NlVDU3hGWUszdU1ORW1aNHpIQjh6SHA5R201WFhKWm90dzBOOHNwQUNEeXg5Y0FnVloyMWlCY3QwZFhKQTU5Mjl6eVN2YzVkdWFCVzRERzktX2hZMGdwYkJIZWZZUDJ1UUJMYmRrSndGSFg3dGdNc3YxZm5zS0FlaWtJU1k5b0FfQm5CRWV1UlAzZGdrSlFYc3dMQUVVaTEtUjVkaW9aamZDX1BPRXZzcmdud0RJcjZZZ1NSM3Z2Skw5NDBPbEpEQWVXOGw1TkdBWXp1Y2Z6Q0o0aVdIY2wwNTRRY2pXWmR1Njgtc3IxNjExMmduaGNYWU9vc2RSdGVRU3d0WHRQSlFwV1JDRVh1ejQzdXRJTmJwTkVSbHctSHl0MDRPSnNFbDFxQnF3bXZnb2xBYVdqNUI4TVIwa2p1Z21mVFlhYWdUUG45Sjg0Y1pxQ1RRaGpwSlg0MzZva2FUeXppWVl5V3BzR2NIMGRuUUE9PQ%3D%3D';
const output = 'public/assets/images/pasterblocks.png';

https.get(url, (response) => {
  const file = fs.createWriteStream(output);
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Image downloaded successfully');
  });
}).on('error', (err) => {
  console.error('Error downloading image:', err.message);
});
