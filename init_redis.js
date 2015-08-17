/**
 * 测试模块:往redis中随机添加数据
 */

var request = require('request');

for(var i = 0;i <= 5;i ++){
	(function(i){
		request.post({
			'url':'http://127.0.0.1:3000/',
			'json':{
				'owner':'bottle' + i,
				'type':'male',
				'content':'content' + i
			}
		});
	})(i);
}

for(var j = 6;j <= 10;j ++){
	(function(j){
		request.post({
			'url':'http://127.0.0.1:3000/',
			'json':{
				'owner':'bottle' + j,
				'type':'female',
				'content':'content' + j
			}
		});
	})(j);
}