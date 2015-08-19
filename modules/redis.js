/**
 * Redis模块
 * 用于构造throw和pick两个方法
 */

var redis = require('redis'),
    client = redis.createClient(),
    client1 = redis.createClient();
//	redis.createClient(port,host,opt)

/**
 * 扔一个漂流瓶,随机分配一个id当存入redis的建,然后根据不同的类型存放到不同的数据库
 * @param  {[type]}   bottle   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.throw = function (bottle, callback) {
    bottle.time = bottle.time || Date.now();
    var curClient = null,
        bottleId = Math.random().toString(16),
    //	为每个瓶子随机生成一个id

        type = {
            'male': 0,
            'female': 1
        };
    //	根据不同类型将不同漂流瓶保存到不同的数据库

    if(type[bottle.type] == 0){
        curClient = client;
    }else{
        curClient = client1;
    }

    console.log('现在应该选择' + type[bottle.type] + '号数据库进行插入');

    curClient.SELECT(type[bottle.type], function () {
        curClient.HMSET(bottleId, bottle, function (err, res) {
            //	以hash类型保存漂流瓶对象

            if (err) {
                return callback({
                    'code': 0,
                    'msg': '过会再试吧!'
                });
            }
            //	保存出错

            callback({
                'code': 1,
                'msg': res
            });
            //	保存成功

            curClient.EXPIRE(bottleId, 86400);
            //	设置过期时间,每个漂流瓶的生成时间为1天
        });
    });
};

/**
 * 捡一个漂流瓶
 * @param  {[type]}   info     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.pick = function (info, callback) {
    var type = {
        'all': Math.round(Math.random()),
        'male': 0,
        'female': 1
    };
    info.type = info.type || 'all';

    client.SELECT(type[info.type], function (err, info) {
        //	根据瓶子的不同类型从不同的库中取

        client.RANDOMKEY(function (err, bottleId) {
            //	随机返回一个漂流瓶id

            if (!bottleId) {
                return callback({
                    'code': 0,
                    'msg': '大海空空如也!'
                });
            }
            //	没有取到漂流瓶

            client.HGETALL(bottleId, function (err, bottle) {
                //	根据返回的id取漂流瓶对象

                if (err) {
                    return callback({
                        'code': 0,
                        'msg': '瓶子破损了!'
                    });
                }
                callback({
                    'code':1,
                    'msg':bottle
                });
                //  返回漂流瓶的信息

                client.DEL(bottleId);
                //  从redis中删除该漂流瓶
            });
        });
    });
};