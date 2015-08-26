/**
 * 程序主文件
 */

var express = require('express');
var path = require('path');
var http = require('http');
var redis = require('./modules/redis');
var mongodb = require('./modules/mongodb');
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
//	post ?owner=xxx&type=xxx&content=xxx[&time=xxx]modules
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

//	捡到一个漂流瓶
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
		if(result.code === 1){
			mongodb.save(req.query.user,req.result.msg,function(err){
				if (err){
					return res.json({
						'code':0,
						'msg':'获取漂流瓶失败,请重试!'
					});
					return res.json(result);
				}
			});
			//	存入mongodb数据库
		}
		res.json(result);
	});
});

//	扔回海里
//	post owner=xxx&type=xxx&content=xxx&time=xxx
app.post('/back',function(req,res){
	redis.throwBack(req.body,function(result){
		res.json(result);
	});
});

//	获取一个用户所有的漂流瓶数据
//	get /user/rwson
app.get('/user/:user',function(req,res){
	mongodb.getAll(req.params.user,function(result){
		res.json(result);
	});
});

//	打开特定的漂流瓶
//	get /bottle/1234567qwe
app.get('/bottle/:_id',function(req,res){
	mongodb.getOne(req.params._id,function(result){
		res.json(result);
	});
});

//	女神,我们做朋友吧
//	post user=xxx&content=xxx[&time=xxx]
app.post('/replay/:_id',function(req,res){
	if(!req.body.user || !req.body.content){
		return res.json({
			'code':0,
			'msg':'信息不完整'
		});
		mongodb.replay(req.params._ud,req.body,function(result){
			res.json(result);
		});
	}
});

//	删除指定id的漂流瓶
//	get /delete/1234shjdashj87238
app.get('/delete/:_id',function(req,res){
	mongodb.delete(function(result){
		res.json(result);
	});
});

app.listen(app.get('port'));
console.log('start up success!');