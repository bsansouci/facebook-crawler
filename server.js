var login = require("facebook-chat-api");
var async = require("async");
var fs = require("fs");
var map = {};

login(function(err, api) {
  if(err) return console.error(err);

  console.log("getFriendsList");

  var rootId = 1216678154;
  api.getFriendsList(rootId, function(err, data) {
    if(err) return console.error(err);

    map.root = [rootId];
    map[rootId] = data;

    fs.writeFile("cache.json", JSON.stringify(map));
    console.log("Got "+data.length+" friends. Going depth 2");
    var total = data.length;
    var cur = 0;
    async.mapLimit(data, 5, function(v, cb) {
      if(v in map) {
        console.log("Using cached version of", v);
        return cb(null, map[v]);
      }

      api.getFriendsList(v, function(err, data2) {
        if(err) return console.error(err);

        console.log(++cur, "/", total, v, data2.length);
        map[v] = data2;
        data2.map(function(val) {
          if(val in map) return;
          map[val] = [];
        });

        if(cur % 10 === 0) fs.writeFile("cache.json", JSON.stringify(map));
        cb(err, data2);
      });
    }, function(err, res) {
      if(err) return console.error(err);

      console.log("DONE --------------- ", Object.keys(map).length);
    });
  });
});