


document.addEventListener('DOMContentLoaded', function () {
    const display = document.querySelector('.display');
    const inputValue = document.querySelector('.input-value');
    const placeholder = document.querySelector('.placeholder');
    const keys = document.querySelectorAll('.key');
    let currentInput = '';
    window.lx = '借款';
    let bz = '';
    window.lsjls = '';
    let amount
    let uurls
    let windows

    // 更新显示
    function updateDisplay() {
        if (currentInput === '') {
            inputValue.textContent = '';
            placeholder.style.display = 'block';
        } else {
            inputValue.textContent = currentInput;
            placeholder.style.display = 'none';
        }
    }

    // 处理键盘点击
    keys.forEach(key => {
        key.addEventListener('click', function () {
            const keyValue = this.textContent;

            if (this.classList.contains('number')) {
                currentInput += keyValue;
            } else if (this.classList.contains('operation')) {
                if (keyValue === '.' && !currentInput.includes('.')) {
                    currentInput += currentInput === '' ? '0.' : '.';
                }
            } else if (this.classList.contains('backspace')) {
                currentInput = currentInput.slice(0, -1);
            } else if (this.classList.contains('confirm')) {
                if (currentInput !== '') {
                    bz = document.getElementById('input').value;
                    window.lsjls = lx + currentInput + bz;

                    if (window.platforms === 'alipay') {
                        uurls = 'historical'
                        windows = window.zfb;

                    } else if (window.platforms === 'wechat') {
                        uurls = 'wx'
                        windows = window.wx;
                    } else if (window.platforms === 'meituan') {
                        uurls = 'mt'
                        windows = window.mt;

                    } else if (window.platforms === 'sry') {
                        uurls = 'srys'
                        windows = window.sry;
                        if (lx == '借款') {
                            lx = '还款';
                        } else {
                            lx = '借款';
                        }

                    }

                    console.log(windows);
                    console.log(currentInput);

                    console.log(parseFloat(windows || 0) - parseFloat(currentInput || 0));
                    console.log(lx);

                    if (lx == '借款') {
                        amount = parseFloat(windows || 0) + parseFloat(currentInput || 0);

                    } else {
                        amount = parseFloat(windows || 0) - parseFloat(currentInput || 0);

                    }

                    //console.log('http://127.0.0.1:3000/api/users/' + uurls);
                    console.log(window.lsjls);
                    console.log(amount);


                    axios.post('http://1z624868f2.wicp.vip/api/users/' + uurls, {
                        historical: window.lsjls,
                        amount: amount
                    })
                        .then(response => {
                            wancheng();

                        })
                        .catch(error => {
                            console.error('无网络链接，转接到本地储存:', error)
                            console.log(uurls + 'DB');
                            if(localStorage.getItem(uurls + 'DB') === null)
                            {
                                let data = [{ 
                                    historical: window.lsjls,
                                    created_at: time(),
                                    amount: amount
                                }]
                                localStorage.setItem(uurls+'DB', JSON.stringify(data));
                            }else{
                                let adddb = JSON.parse(localStorage.getItem(uurls + 'DB'));
                                adddb.push({
                                    historical: window.lsjls,
                                    created_at: time(),
                                    amount: amount
                                });
                                console.log(adddb)
                                localStorage.setItem(uurls+'DB', JSON.stringify(adddb));

                            }
                            
                            

                            let savedUser = JSON.parse(localStorage.getItem(uurls + 'Data'));
                            savedUser.push({
                                historical: window.lsjls,
                                created_at: time(),
                                amount: amount
                            });
                            localStorage.setItem(uurls + 'Data', JSON.stringify(savedUser));
                            wancheng();
                        });

                    function time() {
                        // 获取当前日期时间
                        const now = new Date();

                        // 获取各个部分
                        const year = now.getFullYear();       // 年份（如 2024）
                        const month = now.getMonth() + 1;     // 月份（0-11，需要+1）
                        const date = now.getDate();           // 日期（1-31）
                        const hours = now.getHours();         // 小时（0-23）
                        const minutes = now.getMinutes();     // 分钟（0-59）
                        const seconds = now.getSeconds();     // 秒数（0-59）
                        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`

                    };
                    function wancheng() {
                        vueInstance?.fetchData();


                        document.getElementById('input').value = '';
                        currentInput = ''
                        updateDisplay()
                        if (window.platforms != 'sry') {
                            if (lx == '借款') {
                                document.getElementById('containers').style.display = 'none';


                            }
                        }
                        const elements = document.querySelectorAll('#container');
                        elements.forEach(element => {
                            element.style.filter = 'blur(0px)';
                        });
                        const overlay = document.getElementById('overlay');

                        overlay.classList.remove('active');
                        document.body.style.overflow = ''; // 恢复背景滚动
                    };



                    const elements = document.querySelectorAll('#container');
                    elements.forEach(element => {
                        element.style.filter = 'blur(20px)';
                    });
                    $('#myModal').modal('hide');

                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // 防止背景滚动




                }
            }

            updateDisplay();
        });

    });


    // 初始化显示
    updateDisplay();
});

// 禁用双击放大
document.addEventListener('dblclick', function (e) {
    e.preventDefault();
}, { passive: false });

// 禁用长按上下文菜单（复制菜单）
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// 可选：禁用文字选择
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
});

document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('input');

    // 回车键事件绑定
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('containers').style.display = 'block';
            userInput.blur();
        }
    });
});




