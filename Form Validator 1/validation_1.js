
function Validator (options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement;
        }
    }
    
    // hàm thực hiện validator
    var selectorRules = {};
    function validate (inputElement,rule) {
        var errorMessage 
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message');
        // lấy ra các rule của selectorRules
        // rule.selector này là ở trong object selectorRules
        // console.log(rule.selector + ' kiểm tra selector');
       var rules = selectorRules[rule.selector];
        // console.log(rules + ' kiểm tra rules' );
    //    lặp qua từng rule của selectorRules và kiểm tra
    // nếu có lỗi thì dừng việc kiểm tra cho rule tiếp theo : chẳng hạn như email isRequired 
    // lỗi thì dùng kiểm tra và k ktra email isEmail
    /* giải thích bước kiểm tra:
    khi vào vòng lặp for 
    biến erroeMessage sẽ được gán cho kết quả của fuction rules[i]() ,
    ở fuction này có thể kiểm tra vì mỗi rule của selectorRules bao gồm cả hàm test như bình thường
    
    */ 
   //cần xem lại logic hoạt động
        for(var i=0; i < rules.length ; i++){
            // console.log( rules.length + '  kiểm tra rules.length');
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    ); 
                    break;
                default:
                    errorMessage = rules[i](inputElement.value); 

                    
            }
            // console.log(errorMessage);
            if(errorMessage) break;
        }

       if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }else {
            errorElement.innerText = ' ';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');

        }
        return !errorMessage;
    };
    
    // hàm thực hiện lấy formElement vào gọi hàm để xử lí bài toán
     var formElement = document.querySelector(options.form); 
    if(formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
           //lặp qua từng rule và thực hiện validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isvalid = validate(inputElement,rule);
                if (!isvalid) {
                    isFormValid = false;
                }
            })
            
            if (isFormValid) {
                //trường hợp với javascript
                // code lấy ra value cho input 
                if (typeof options.onsubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name] ')
                        var formValues = Array.from(enableInputs).reduce(function(values,input){
                        //    console.log(input.name + ' : ' + input.value+ ' input');
                        //  console.log(values + ' values');  
                        switch(input.type){
                            case 'radio':
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value;
                                    break;
                                }
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked'))                               
                                return values;
                                // values ở đây là object trống , thế nên khi lặp qua vòng lặp thì biến values sẽ đưa vào giá trị rỗng
                                //tức là không có giá trị 
                                
                                if(!Array.isArray(values[input.name])) {                               
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);                                
                                break;
                            case 'file':
                                // console.log(input.files + ' file' );
                                values[input.value] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        } 
                        return values;
                    },{});          
                    options.onsubmit(formValues);
                }
                //trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            } 
        }
        options.rules.map(function(rule) {
            // lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
                // console.log(selectorRules[rule.selector]);
            }
            // selectorRules[rule.selector] = rule.test;
            // lấy ra thẻ input thực hiện event blur
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement,rule);
                   }
                //xử lí mỗi khi người dùng nhập vào input
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message');
                        errorElement.innerText = ' ';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
    
                    }
            });
           
        })
        // console.log(selectorRules);
    };
    
}

// Định nghiã rules
Validator.isRequired = function(selector,message) {
    return {
        selector : selector,
        test: function(value) {
            // console.log(value);
             return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.isEmail = function(selector,message) {  
    return {
        selector : selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
             return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}
Validator.minLenght = function (selector,min,message) {  
    return {
        selector : selector,
        test: function(value) {
            // console.log(selector);
            // console.log(value.length);
            // console.log('min = ' + min);
             return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}
// kiểm tra sự trùng khớp giữa mật khẩu vừa nhập và mật khẩu đã nhập
/*
b1: lấy được value từ mật khẩu tại hàm nhập lại mật khẩu

*/
Validator.isConfirm = function(selector,password,message) {  
    return {
        selector : selector,
       
        test: function(value) {
            // console.log(password);
           return value === password() ? undefined : message || 'Giá trị nhập vào không chính xác '
        }
    }
}