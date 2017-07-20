// 当访问/ooxx时,检测到没权限此时跳到/login?url=/ooxx即可登录后跳转到之前想登录的页面
app.post('/login', function (req, res, next) {
  // 验证账户密码
  checkLogin(req.body.username, req.body.password, function (ok) {
    if (ok) {
      // 跳转到登录前的页面，如果没有设置就跳转到首页
      res.redirect(req.query.url || '/');
    } else {
      // 重新显示登录页面
    }
  });
});
