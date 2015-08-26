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

/**
 * 回复特定id的漂流瓶
 * @param  {[type]}   _id      [description]
 * @param  {[type]}   replay   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.replay = function(_id,replay,callback){
	var time = replay.time || Date.now();
	bottleModel.findById(_id,function(err,_bottle){
		//	通过id找到漂流瓶

		if(err){
			return callback({
				'code':0,
				'msg':'回复失败......'
			});
		}
		//	没有找到相应的瓶子
			
		var newBottle = {
			'bottle':_bottle.bottle,
			'message':_bottle.message
		};
		if(newBottle.bottle.length === 1){
			newBottle.bottle.push(_bottle.message[0][0]);
		}
		//	如果捡瓶子的人是第一次回复漂流瓶,则在bottle键添加漂流瓶主人
		//	如果已经回复过,则不再添加

		newBottle.message.push([replay.user,replay.name,replay.content]);
		//	在message上添加一条信息

		bottleModel.findByIdAndUpdate(_id,newBottle,function(err,bottle){
			//	更新相关信息

			if(err){
				return callback({
					'code':0,
					'message':'回复失败......'
				});
			}
			//	更新失败

			callback({
				'code':1,
				'message':bottle
			});
		});
	});
};

exports.delete = function(_id,callback){
	bottleModel.findByIdAndRemove(_id,function(err){
		//	通过id找到瓶子并且删除

		if(err){
			return callback({
				'code':0,
				'msg':'删除漂流瓶失败......'
			});
		}
		//	删除失败
	
		callback({
			'code':1,
			'msg':'删除成功'
		});
	});
};