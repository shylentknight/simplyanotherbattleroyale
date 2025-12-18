const socket = io();

let players = {};
let cursors;
let playerSprites = {};

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    create: function() {
      cursors = this.input.keyboard.createCursorKeys();

      socket.on('currentPlayers', data => {
        players = data;
        Object.keys(players).forEach(id => {
          playerSprites[id] = this.add.rectangle(players[id].x, players[id].y, 20, 20, 0x00ff00);
        });
      });

      socket.on('newPlayer', player => {
        playerSprites[socket.id] = this.add.rectangle(player.x, player.y, 20, 20, 0x00ff00);
      });

      socket.on('playerMoved', data => {
        if (playerSprites[data.id]) {
          playerSprites[data.id].x = data.x;
          playerSprites[data.id].y = data.y;
        }
      });

      socket.on('playerDisconnected', id => {
        if (playerSprites[id]) {
          playerSprites[id].destroy();
          delete playerSprites[id];
        }
      });
    },
    update: function() {
      let moved = false;
      let player = players[socket.id];
      if (!player) return;

      if (cursors.left.isDown) { player.x -= 2; moved = true; }
      if (cursors.right.isDown) { player.x += 2; moved = true; }
      if (cursors.up.isDown) { player.y -= 2; moved = true; }
      if (cursors.down.isDown) { player.y += 2; moved = true; }

      if (moved) {
        socket.emit('move', { x: player.x, y: player.y });
      }
    }
  }
};

new Phaser.Game(config);
