/**
 * Redis模块
 * 用于构造throw和pick两个方法
 */

var redis = require('redis'),
    client = redis.createClient(),
    client1 = redis.createClient(),
    client2 = redis.createClient(),
    client3 = redis.createClient();
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
        bottleId = Math.random().toString(16);
    //	为每个瓶子随机生成一个id

    if(type[bottle.type] == 0){
        curClient = client;
    }else{
        curClient = client1;
    }

    client2.SELECT(2,function(){
        //  进入2号数据库检查用户是否超过扔瓶子次数

        client2.GET(bottle.owner,function(err,res){
            if(res >= 10){
                return callback({
                    'code':0,
                    'msg':'今天扔瓶子的机会用完啦!'
                });
            }
            //  如果超过10次,给出错误提示

            client2.INCR(bottle.owner,function(){
                //  次数加1

                client2.TTL(bottle.owner,function(err,ttl){
                    if(ttl === -1){
                        client2.EXPIRE(bottle.owner,86400);
                    }
                    //  检查是否当天第一次扔瓶子
                    //  如果是,设置该用户扔瓶子次数生存期为1天
                    //  如果不是,生存期不变
                });
            });

            curClient.SELECT(type[bottle.type], function () {
                curClient.HMSET(bottleId, bottle, function (err, res) {
                    //  以hash类型保存漂流瓶对象

                    if (err) {
                        return callback({
                            'code': 0,
                            'msg': '过会再试吧!'
                        });
                    }
                    //  保存出错

                    callback({
                        'code': 1,
                        'msg': res
                    });
                    //  保存成功

                    curClient.EXPIRE(bottleId, 86400);
                    //  设置过期时间,每个漂流瓶的生成时间为1天
                });
            });

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
    if(Math.random() < 0.2){
        return callback({
            'code':0,
            'msg':'海星'
        });
    }
    var type = {
        'all': Math.round(Math.random()),
        'male': 0,
        'female': 1
    };
    info.type = info.type || 'all';

    client3.SELECT(3,function(){
        //  进入3号数据库,检查用户捡瓶子是否超过次数

        client3.GET(info.user,function(err,result){
            if(result >= 10){
                return callback({
                    'code':0,
                    'msg':'今天捡瓶子的机会用完啦!'
                });
            }
            //  捡瓶子机会用完了

            client3.INCR(info.user,function(){
                //  捡瓶子次数加1

                client3.TLL(info.user,function(err,tll){
                    if(ttl === -1){
                        client2.EXPIRE(bottle.owner,86400);
                    }
                    //  检查是否当天第一次捡瓶子
                    //  如果是,设置该用户捡瓶子次数生存期为1天
                    //  如果不是,生存期不变

                });
            });
            client.SELECT(type[info.type], function (err, info) {
                //  根据瓶子的不同类型从不同的库中取

                client.RANDOMKEY(function (err, bottleId) {
                    //  随机返回一个漂流瓶id

                    if (!bottleId) {
                        return callback({
                            'code': 0,
                            'msg': '海星'
                        });
                    }
                    //  没有取到漂流瓶

                    client.HGETALL(bottleId, function (err, bottle) {
                        //  根据返回的id取漂流瓶对象

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
        });
    });
};

/**
 * 扔回
 * @param  {[type]}   bottle   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.throwBack = function(bottle,callback){
    var curClient = null,
    bottleId = Math.random().toString(16);
    //  为瓶子随机生成一个id

    if(type[bottle.type] == 0){
        curClient = client;
    }else{
        curClient = client1;
    }

    curClient.SELECT(type[bottle.type], function () {
        curClient.HMSET(bottleId, bottle, function (err, res) {
            //  以hash类型保存漂流瓶对象

            if (err) {
                return callback({
                    'code': 0,
                    'msg': '过会再试吧!'
                });
            }
            //  保存出错

            callback({
                'code': 1,
                'msg': res
            });
            //  保存成功

            curClient.PEXPIRE(bottleId, bottle.time - 86400000 - Date.now());
            //  设置过期时间,每个漂流瓶的生成时间为1天
            //  PEXPIRE和EXPIRE都是设置生存时间,但是前者以毫秒为单位,后者以秒为单位
        });
    });
};