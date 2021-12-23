var http = require("http");
var url = require("url");
var qs = require("querystring");
var fs = require("fs");

// 读取文件
function readFileFnc (cb, fail) {
  fs.readFile("db.txt", "utf-8", function (err, data) {
    if (!err && data) {
      console.log("文件中有数据");
      cb(data)
    } else {
      console.log("读取文件失败");
      fail()
    }
  })
}

function registerUser (user, res, arr) {
  //根据前端发来的路由地址判断是登录还是注册页面，如果是注册页面
  //同步写入db.txt文件
  var userList = arr || []
  userList.push(user)
  fs.writeFileSync("db.txt", JSON.stringify(userList), "utf-8");
  sendMsg(res, '注册成功!', 200)
}

function sendMsg (res, msg, code = 200) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({code, msg}))
}

http.createServer(function (req, res) {
  //设置请求头
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method == "POST") {
    //接收发来的用户名和密码
    var result = "";
    //获取前端代码发来的路由地址
    var pathName = url.parse(req.url).pathname;

    req.addListener("data", function (chunk) {
      result += chunk;
    });

    req.on("end", function () {
      var user = qs.parse(result);
      //判断用户是否存在
      (!user.username || !user.password) && sendMsg(res, '请输入用户名或密码', 103)
      console.log(123123);
      if (pathName === '/login') {
        // 登录页
        readFileFnc(
          function (data) {
            var arr = JSON.parse(data);
            //遍历整个保存数据的数组  判断登录注册
            if (Array.isArray(arr)) {
              const userInfo = arr.find(obj => obj.username == user.username)
              if (userInfo) {
                if (userInfo.password == user.password) {
                  sendMsg(res, '登录成功！', 200)
                } else {
                  sendMsg(res, '密码错误！', 101)
                }
              } else {
                sendMsg(res, '该用户不存在', 102)
              }
            }
          },
          function () {
            sendMsg(res, '该用户不存在', 102)
          }
        )
      } else if (pathName === '/register') {
        // 注册页
        console.log('zhuce')
        readFileFnc(
          function (data) {
            var arr = JSON.parse(data);
            //遍历整个保存数据的数组  判断登录注册
            if (Array.isArray(arr)) {
              const userInfo = arr.find(obj => obj.username == user.username)
              if (userInfo) {
                sendMsg(res, '该用户已存在', 101)
              } else {
                registerUser(user, res, arr)
              }
            }
          },
          function () {
            console.log(user, '123123')
            registerUser(user, res)
          }
        )
      }
    });
  } else {
    res.end("get请求");
  }
}).listen(3000, function (err) {
  if (!err) {
    console.log("服务器启动成功，正在监听port3000...");
  }
});