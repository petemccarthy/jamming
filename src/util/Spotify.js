let userAccessToken = '';
const spotifyUrl = 'https://accounts.spotify.com/authorize'
const clientID = 'f4b81513a7c446bea1d9451bcd126f71';
const redirectURI = 'http://localhost:3000/';


let Spotify = {
    getAccessToken() {
        if (userAccessToken) {
            return userAccessToken;
        } 

        const url = window.location.href;
        const accessToken = url.match(/access_token=([^&]*)/);
        const expiresIn = url.match(/expires_in=([^&]*)/);

            if (accessToken && expiresIn) {
                userAccessToken = accessToken[1];
                const expirationTime = Number(expiresIn[1]) * 1000;
                window.setTimeout(() => userAccessToken = '', expirationTime);
                window.history.pushState('Access Token', null, '/');
                return userAccessToken;
            } else {
                window.location.assign(`${spotifyUrl}?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`)
             }
        },
    search(term) {
            const accessToken = this.getAccessToken();
            const endpoint = `https://api.spotify.com/v1/search?type=track&q=${term}`

            return fetch(endpoint,{
                headers: {
                   Authorization: `Bearer ${accessToken}`
                }
            })
            .then(response => {
                return response.json();
            }).then(jsonResponse => {
                if (!jsonResponse.tracks) {
                    return [];
                }
                return jsonResponse.tracks.items.map(track => {
                    console.log(jsonResponse.tracks);
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }
                });
            })

        },

    savePlaylist(playlistName, trackURIs) {
        
        const accessToken = this.getAccessToken();
        if (!playlistName || !trackURIs) {
            console.log('playlistName or trackURIs empty');
            return;
        } else {
            return fetch('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }})
            .then(response => response.json())
            .then(jsonResponse => jsonResponse.id)
            .then(userId => {
                const myUserId = userId;
                fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                  body: JSON.stringify({name: playlistName}),
                  headers: {
                      Authorization: `Bearer ${accessToken}`
                  },
                  method: 'POST'
            })
              .then(response => response.json())
              .then(jsonResponse => {
                  console.log('reached this step');
                  const playlistId = jsonResponse.id;
                  fetch(`https://api.spotify.com/v1/users/${myUserId}/playlists/${playlistId}/tracks`,
                  {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                      body: JSON.stringify({uris: trackURIs}),
                      method: 'POST',
    
                  }
                )
              }
            )
          });
            
        }


    }
}

export default Spotify;