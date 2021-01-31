

const target = document.querySelector('.target');
const leaderBoard = document.querySelector('.leader-board');

let drops = [];
const currentUsers = {};
let highScore = [];

function createDrop(url, username, isAvatar = false) {

    const div = document.createElement('div');

    div.className = 'drop';
    div.innerHTML = `
        <h4 class="username">${username}</h4>
        <img class="globe" src="assets/images/globe.svg" alt="">
        <div class="user-image">
            <img class="${isAvatar ? 'avatar' : ' '}"
                src="${url}"
                alt="">
        </div>
    `;

    return div;

}

const dropPrototype = {
    getLeft() {
      return this.location.x - this.element.clientWidth / 2;
    },
    getRight() {
      return this.location.x + this.element.clientWidth / 2;
    },
    getTop() {
      return this.location.y;
    },
    getBottom() {
      return this.location.y + this.element.clientHeight;
    },
    getCenter() {
      return {
        x: this.location.x,
        y: (this.getTop() + this.getBottom()) / 2,
      };
    }
  };

function doDrop({ image_url, url, username, isAvatar = false }) {

    currentUsers[username] = true;
    const element = createDrop(url, username, isAvatar);

    const drop = {
        __proto__: dropPrototype,
        image_url,
        username,
        element,
        location: {
            //x: window.innerHeight / 2, //Center Drop Test
            x: window.innerWidth * Math.random(),
            y: -200,
        },
        velocity: {
            //x: 0, //Center Drop Test
            x: Math.random() * (Math.random() > 0.5 ? -1 : 1) * 10,
            y: 2 + Math.random() * 8
        }
    };
    
    drops.push(drop);
    document.body.appendChild(element);

    updateDropPosition(drop);



}

function updateDropPosition(drop) {
    if (drop.landed) return;
    drop.element.style.top = drop.getTop() + 'px';
    drop.element.style.left = drop.getLeft() + 'px';
}

function checkAABBCollision(A, B) {
    const AisToTheRightOfB = A.getLeft() > B.getRight();
    const AisToTheLeftOfB = A.getRight() < B.getLeft();
    const AisAboveB = A.getBottom() < B.getTop();
    const AisBelowB = A.getTop() > B.getBottom();
    return !(
      AisToTheRightOfB
      || AisToTheLeftOfB
      || AisAboveB
      || AisBelowB
    );
  }

  function isMovingAway(drop, drop2) {
    if(drop.getCenter().x < drop2.getCenter().x) {
      return drop.velocity.x < drop2.velocity.x;
    }
    else {
      return drop.velocity.x > drop2.velocity.x;
    }
  }
  
  function processCollision(drop, drop2) {
    if(
      !checkAABBCollision(drop, drop2)
      || isMovingAway(drop, drop2)
    ) {
      return;
    }
    // TODO: Implement a proper 2D impulse exchange when the gravity is implemented.
    // Now it could result in one of the drops flying upwards forever after collision.
    // For now exchanging x velocity works good enough.
    const tmp = drop.velocity.x;
    drop.velocity.x = drop2.velocity.x;
    drop2.velocity.x = tmp;
  }
  
  function processCollisions() {
    for(let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      for(let j = i + 1; j < drops.length; j++) {
        const drop2 = drops[j];
        processCollision(drop, drop2)
      }
      // Process collisions with the browser edges
      if(drop.getLeft() < 0) {
        drop.velocity.x = Math.abs(drop.velocity.x)
      }
      else if(drop.getRight() >= window.innerWidth) {
        drop.velocity.x = -Math.abs(drop.velocity.x);
      }
    }
  }

function update() {
    processCollisions();

    const targetHalfWidth = target.clientWidth / 2;
    let isNewUser = true;
    drops.forEach(drop => {

        if (drop.landed) return;

        drop.location.x += drop.velocity.x;
        drop.location.y += drop.velocity.y;

        const halfWidth = drop.element.clientWidth / 2;
        if (drop.location.x + halfWidth >= window.innerWidth) {
            drop.velocity.x = -Math.abs(drop.velocity.x);
        } else if (drop.location.x - halfWidth < 0) {
            drop.velocity.x = Math.abs(drop.velocity.x);
        }


        if (drop.location.y + drop.element.clientHeight >= window.innerHeight) {
            drop.velocity.y = 0;
            drop.velocity.x = 0;
            drop.location.y = window.innerHeight - drop.element.clientHeight;
            drop.landed = true;

            drop.element.classList.add('landed');
            const { x } = drop.location;
            const score = Math.abs(window.innerWidth / 2 - x);

            if (score <= targetHalfWidth) {
                const finalScore = (1 - (score / targetHalfWidth)) * 100;
                leaderBoard.style.display = 'block';

                if (highScore.length != 0) {

                    highScore.filter((u) => {
                        if (u.username === drop.username) {
                            u.score = finalScore.toFixed(2);
                            isNewUser = false;
                        }
                    });

                    if (isNewUser) {
                        addedScore(drop, finalScore);
                    }
                } else {
                    addedScore(drop, finalScore);
                }

                highScore.sort((a, b) => b.score - a.score);
                highScore = highScore.slice(0, 5);
                renderLeaderBoard();
            }

            drops = drops.filter(d => d != drop);
            setTimeout(() => {
                currentUsers[drop.username] = false;
                document.body.removeChild(drop.element);
            }, 90000);
        }

    });
}

function addedScore(drop, finalScore) {
    highScore.push({
        username: drop.username,
        score: finalScore.toFixed(2),
        image_url: drop.image_url
    });
}

function renderLeaderBoard() {
    const scores = leaderBoard.querySelector('.scores');
    scores.innerHTML = highScore.reduce((html, { score, username, image_url }) => {
        return html + `<p>${score}  points - <img class="img-score" src="${image_url}" alt="">${username}</p>`;
    }, '');
}

function draw() {
    drops.forEach(updateDropPosition);
}




function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


gameLoop();

const client = new tmi.Client({
    connection: { reconnect: true },
    identity: {
		username: document.currentScript.getAttribute('username'),
		password: document.currentScript.getAttribute('password')
	},
    channels: [document.currentScript.getAttribute('userTwitch')]
});

client.connect();

client.on('message', async  (channel, { emotes, username, 'display-name': displayName, 'user-id': userId }, message, self) => {

    if (message.startsWith('!drop')) {
        const name = displayName || username;
        //if (currentUsers[name]) return;
        const args = message.split(' ');
        args.shift();
        const url = args.length ? args[0].trim() : '';
        let user = await getUser(userId);
        let image_url = user.logo.replace('300x300', '70x70');
        if (emotes) {
            const emotesList = Object.keys(emotes);
            const emote = emotesList[Math.floor(Math.random() * emotesList.length)];

            doDrop({
                image_url: image_url,
                url: `https://static-cdn.jtvnw.net/emoticons/v1/${emote}/2.0`,
                username: name
            });
        } else {
            
            doDrop({
                image_url: image_url,
                url: image_url,
                username: name,
                isAvatar: true
            });
        }

        client.say(channel, `@${username}, heya!`);
    }
});

async function getUser(userId) {

    const user = (async () => {
      const response = await fetch(`https://api.twitch.tv/kraken/users/${userId}`, {
        headers: {
          accept: 'application/vnd.twitchtv.v5+json',
          'client-id': 'xhx6zirpku0ila1y8sx94o6qrq54dk',
        }
      });
      return response.json();
    })();

    return user;
  };