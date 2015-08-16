/**
 * 程序主文件
 */

var express = require('express');
var path = require('path');
var http = require('http');
var redis = require('redis');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//	扔一个漂流瓶
//	post ?owner=xxx&type=xxx&content=xxx[&time=xxx]
app.post('/',function(req,res){
	if(!req.body.owner || !req.body.type || !req.body.content){
		if(req.body.type && (['male','female'].indexOf(req.body.type) == -1)){
			return res.json({
				'code':0,
				'msg':'类型错误!'
			});
			return res.json({
				'code':0,
				'msg':'信息不完整!'
			});
		}
	}
	redis.throw(req.body,function(result){
		res.json(result);
	});
});

//	扔一个漂流瓶
//	get ?user=xxx[&type=xxx]
app.get('/',function(req,res){
	if(!req.query.user){
			return res.json({
				'code':0,
				'msg':'信息不完整!'
			});
	}
	if(req.query.type && (['male','female'].indexOf(req.query.type) == -1)){
		return res.json({
			'code':0,
			'msg':'类型错误!'
		});
	}
	redis.pick(req.query,function(result){
		res.json(result);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('startup successful!');
});
