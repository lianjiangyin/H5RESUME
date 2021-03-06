let loadingRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');
    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];
    //run:预加载图片
    let n = 0,
        len = imgData.length;
    let run = function (callback) {
        imgData.forEach((item) => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', (++n) / len * 100 + '%');
                //=>加载完成：执行回调函数(让当前loading页面消失)
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        })
    };
    //maxDelay:设置最长等待时间(假设10S，到达10S我们看加载多少了，如果已经达到了90%以上，我们可以正常访问内容了，如果不足这个比例，直接提示用户当前网络状况不佳，稍后重试)
    let delayTimer = null;
    let maxDelay = function (callback) {
        delayTimer = setTimeout(() => {
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('非常遗憾，当前您的网络状况不佳，请稍后再试！');
            window.location.href = 'http://www.qq.com'; //此时我们不应该继续加载图片，而是让其关掉页面或者是跳转到其他页面
        }, 10000);
    };
    //done:完成
    let done = function () {
        //停留一秒钟再进入下个页面
        let timer = setTimeout(() => {
            $loadingBox.remove();
            clearTimeout(timer);

            phoneRender.init();
        }, 1000);
    };
    return {
        init: function () {
            $loadingBox.css('display','block');
            run(done);
            maxDelay(done)
        },
    }
})();

let phoneRender = (function () {
    let $phoneBox =$('.phoneBox'),
        $time =$phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $hang =$phoneBox.find('.hang'),
        $answerMarkLink =$answer.find('.markLink'),
        $hangMarkLink =$hang.find('.markLink'),
        answerBell =$('#answerBell')[0],
        introduction =$('#introduction')[0];
        let answerMarkTouch =function () {
            //1、remove answer
            $answer.remove();
            answerBell.pause();
            $(answerBell).remove(); //一定要先暂停再移除，否则即使移除了浏览器也会播放着这个声音
            //2、show hang
            $hang.css('transform','translateY(0rem)');
            $time.css('display','block');
            introduction.play();
            computedTime();
        };

        //计算播放时间
    let autoTimer =null;
    let computedTime =function () {
        let duration = 0;
        //我们让audio播放，首先会加载完成，部分资源加载完成才会播放，才会计算出总时间duration等信息，我们可以把获取信息放到canplay事件中
        introduction.oncanplay =function () {
          duration =introduction.duration ;
        };
        autoTimer =setInterval(()=>{
           let val =introduction.currentTime;
            if(val>=duration){
                clearInterval(autoTimer);
                return ;
            }
           let minute =Math.floor(val/60),
               second = Math.floor(val -minute *60);
           //播放完成

           minute=minute<10?"0"+minute:minute;
           second=second<10?"0"+second:second;
           $time.html(`${minute}:${second}`);
       },1000);
    };
    // 关闭phone
    let closePhone =function () {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();
        messageRender.init();
    };
    return {
        init: function () {
            $phoneBox.css('display','block');
            //=>播放bell
            answerBell.play();
            answerBell.volume=0.3;
            //点击answer-mark
            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        },
    }
})();

let messageRender = (function () {
    let $messageBox =$('.messageBox'),
        $wrapper =$messageBox.find('.wrapper'),
        $messageList =$wrapper.find('li'),
        $keyBoard =$messageBox.find('.keyBoard'),
        $textInp=$keyBoard.find('span'),
        $submit =$keyBoard.find('.submit'),
        demonMusic =$('#demonMusic')[0];
    let step = -1, //记录当前展示信息的索引
        total =$messageList.length+1, //记录的是信息的总条数
        autoTimer =null,
        interval =2000; //记录多久发一条信息
    //展示信息
    let tt =0;
    let showMessage = function () {
        ++step;
        if(step===2){
            //已经展示两条了，此时我们暂时结束自动信息发送，让键盘出来，开始执行手动发送。
            clearInterval(autoTimer);
            handleSend();
            return ;
        }
        let $cur =$messageList.eq(step);
        $cur.addClass('active');
        if(step>=3){
            //说明展示的条数已经是四条以上了，此时我们让wrapper向上移动(移动的距离是新展示这一条的高度)
            // let curH =$cur[0].offsetHeight,
            //     wraT =parseFloat($wrapper.css('top'));
            // $wrapper.css('top',wraT-curH);
            let curH =$cur[0].offsetHeight;
            tt-=curH;
            $wrapper.css('transform',`translateY(${tt}px)`);
        }
        if(step>=total-1){
            //展示完了
            clearInterval(autoTimer);
            closeMessage();
        }
    };
    let handleSend =function () {
        $keyBoard.css('transform','translateY(0rem)').one('transitionend',()=>{
            //transitionend 监听当前元素transition动画结束的事件 并且有几个样式属性改变 ，并且执行了过渡效果，事件就会被触发执行几次
            //=> 用one方法做事件绑定 只会让其触发一次
            let str ='北方有佳人，绝世而独立。',
                n =-1,
                textTimer =null;
            textTimer=setInterval(()=>{
                let orginHTML =$textInp.html();
                    $textInp.html(orginHTML+str[++n]);
                    if(n>=str.length-1){
                        //文字显示完成
                        clearInterval(textTimer);
                        $submit.css('display','block');
                    }
                },500)
        });
    };

    //点击submit
    let handleSubmit =function () {
        //把新创建的li增加到页面中第二个Li的后面
        $(`<li class="self">
                <i class="arrow"></i>
                <img src="img/zf_messageStudent.png" alt="" class="pic">
                ${$textInp.html()}
            </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList =$wrapper.find('li'); //把新的li放到页面中，我们此时应该获取新的li，让messageList和页面中的Li正对应，方便后期根据索引展示对应的Li
        //该消失的消失
        $textInp.html('');
        $submit.css('display','none');
        $keyBoard.css('transform','translateY(3.7rem)');

        //继续展示剩余的消息
        autoTimer =setInterval(showMessage,interval);
    };
    //关掉message 页面
    let closeMessage =function () {
        let delayTimer =setTimeout(()=>{
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer) ;

            cubeRender.init();

        },interval)
    };
    return {
        init: function () {
            $messageBox.css('display','block');
            //加载模块立即展示一条信息，后期间隔2S再发送一条信息
            showMessage();
            autoTimer =setInterval(showMessage,interval);
            $submit.tap(handleSubmit);

            //MUSIC
            demonMusic.play();
            demonMusic.volume=0.3;
        },
    }
})();

let cubeRender = (function () {
    let $cubeBox =$('.cubeBox'),
        $cube =$('.cube'),
        $cubeList =$cube.find('li');
    //手指按住旋转
    let start =function (ev) {
        let point =ev.changedTouches[0];
        this.strX =point.clientX;
        this.strY =point.clientY;
        this.changeX =0;
        this.changeY =0;
    };
    let move =function (ev) {
        //用最新手指的位置-起始的位置，记录Xy轴的偏移
        let point =ev.changedTouches[0];
        this.changeX =point.clientX -this.strX;
        this.changeY =point.clientY -this.strY;
    };
    let end =function (ev) {
        //获取change/rotate值
        let {changeX,changeY,rotateX,rotateY} =this,
            isMove =false ;
        //验证是否发生移动(判断滑动误差)
        Math.abs(changeX)>10 ||Math.abs(changeY)>10?isMove =true :null;
        //只有发生移动才做处理
        if(isMove){
            //1、左右滑动 =>changeX rotateY(正比change越大 rotate越大)
            //2、上下滑动 =>changeY rotateX (反比change越大 rotate越小)
            rotateX =rotateX - changeY/3;
            rotateY =rotateX + changeY/3;
            //赋值给魔方盒子
            $(this).css('transform',`scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //让当前旋转的角度成为下一次起始的角度
            this.rotateX  =rotateX ;
            this.rotateY  =rotateY ;
        }
        //清空其他记录的自定义属性
        ['strX','strY','changeX','changeY'].forEach(item=>{
            this[item] =null;
        })
    };

    return {
        init: function () {
            $cubeBox.css('display','block');
            //手指操作cube，让cube跟着旋转
            let cube =$cube[0];
            cube.rotateX =-35;
            cube.rotateY =35; //记录初始的旋转角度(存储到自定义属性上)
            $cube.on('touchstart',start)
                .on('touchmove',move)
                .on('touchend',end);

            //点击每一个面跳转到详情区域对应的页面
            $cubeList.tap(function () {
                $cubeBox.css('display','none');
                //跳转到详情区域，通过传递点击li索引，让其定位到具体的slide
                let index =$(this).index();
                detailRender.init(index);
            });
        },
    }
})();

let detailRender = (function () {
    let $detailBox =$('.detailBox'),
        swiper =null,
        $dl =$('.page1>dl');
    let swiperInit =function () {
        swiper =new Swiper('.swiper-container',{
            effect:'coverflow',
            // loop:true //swiper有一个bug:3D切换设置loop为true的时候，偶尔会出现无法切换的情况(2D效果没问题) 无缝切换的原理:把真实第一张克隆一份放到末尾，把真实第一张也克隆一份放到开始(真实slide有五张，wrapper里会有七个slide)
            onInit:move,
            /*(swiper)=>{
                //初始化成功执行的回调函数(参数是当前初始化的实例)

            },*/
            onTransitionEnd:move
            /*(swiper)=>{
                //切换动画完成执行的回调函数

            }*/
        });
        //实例的私有属性
        //1、activeIndex 当前展示slide块的索引
        //2、slides 获取所有的slide(数组)
        //实例的公有方法
        //1、slideTo 切换到指定索引的slide
    };
    let move =function (swiper) {
        //swiper 当前创建的实例
        //1、判断当前是否为第一个slide:如果是，让3D菜单展开，不是收起3D菜单
        let activeIndex =swiper.activeIndex,
            slideAry = swiper.slides ;
        if(activeIndex===0){
            //PAGE1
            //实现折叠效果
            $dl.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8
            });
            $dl.makisu('open');
        }else{
            //OTHER PAGE
            $dl.makisu({
                selector:'dd',
                speed:0
            });
            $dl.makisu('close');
        }
        slideAry.forEach((item,index)=>{
            if(activeIndex===index){
                item.id =`page${index+1}`;
                return ;
            }
            item .id =null;
        })
    };
    return {
        init: function (index) {
            $detailBox.css('display','block');
            if(!swiper){
                //防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index,0); //直接运动到具体的slide页面(第二个)

        },
    }
})();

$(document).on('touchstart touchmove touchend',(ev)=>{
   ev.preventDefault();
});

//开发过程中，由于当前项目板块过多，(每一个板块都是一个单例)，我们最好规划一个机制:通过标识的判断可以让程序员执行对应板块的内容，这样开发哪个板块，我们就把标识改为啥。(HASH路由控制)
let url = window.location.href, //获取当前页面的URL地址 location.href='xxx' 让其跳转到哪一个页面
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substr(well + 1);
switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case  'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break ;
    case 'cube':
        cubeRender.init();
        break ;
    case 'detail':
        detailRender.init();
        break ;
    default:
        loadingRender.init();
}