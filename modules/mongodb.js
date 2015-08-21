var mongoose = require('mongoose'),
	bottleModel = mongoose.model('Bottle',new mongoose.Schema({
		'bottle':Array,
		'message':Array
	},{
		'collection':'bottles'
	}));
	//	设置要存入数据库的模型
mongoose.connect('mongodb://127.0.0.1:27017/drifter');
	//	连接到数据库

/**
 * 将用户捡到的漂流瓶数据改变格式保存
 * @param  {[type]}   picker   [description]
 * @param  {[type]}   _bottle  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.save = function(picker,_bottle,callback){
	var bottle = {
		'bottle':[],
		'message':[]
	};
	bottle.bottle.push(picker);
	bottle.message.push([_bottle.user,_bottle.time,_bottle.content]);
	bottle = new bottleModel(bottle);
	bottle.save(function(err){
		callback(err);
	});
};

/**
 * 获取用户捡到的所有漂流瓶
 * @param  {[type]}   user     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getAll = function(user,callback){
	bottleModel.find({
		'bottle':user
	},function(err,bottles){
		//	通过user找出该用户捡到的所以瓶子
		
		if(err){
			return callback({
				'code':0,
				'msg':'获取数据失败...'
			});
		}
		//	查询失败

		callback({
			'code':1,
			'msg':bottles
		});
	});
};

/**
 * 打开特定的漂流瓶
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getOne = function(_id,callback){
	bottleModel.findById(_id,function(err,bottle){
		//	通过id获取漂流瓶数据

		if(err){
			return callback({
				'code':0,
				'msg':'对不起!打开失败!'
			});
		}
		//	打开失败

		callback({
			'code':1,
			'msg':bottle
		});
	});
};