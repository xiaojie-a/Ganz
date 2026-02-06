


document.addEventListener('DOMContentLoaded', function () {
    const display = document.querySelector('.display');
    const inputValue = document.querySelector('.input-value');
    const placeholder = document.querySelector('.placeholders');
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
                        let amounts = parseFloat(window.sry || 0) - parseFloat(currentInput || 0);
                        axios.post('/api/users/srys', {
                            historical: '借款'+currentInput+'还债',
                            amount: amounts
                        })
                            .then(response => {
                            
    
                            })
                            .catch(error => console.error('Error:', error.response.data));

                    }

                    console.log('/api/users/' + uurls);
                    console.log(window.lsjls);
                    console.log(amount);


                    axios.post('/api/users/' + uurls, {
                        historical: window.lsjls,
                        amount: amount
                    })
                        .then(response => {
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

                        })
                        .catch(error => console.error('Error:', error.response.data));
                    const elements = document.querySelectorAll('#container');
                    elements.forEach(element => {
                        element.style.filter = 'blur(20px)';
                    });
                    bootstrap.Modal.getInstance(document.getElementById('myModal')).hide();

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




