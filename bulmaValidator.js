var BulmaValidator = function(settings={},validations={}) {

    var $ = jQuery.noConflict();

    this.config = $.extend({}, {
        lazy: true,
        scroll: true,
        requiredMessage: 'Required field',
        successIcon: 'fas fa-check',
        errorIcon: 'fas fa-exclamation-triangle',
        sections: {},
        classes: {
            danger: "is-danger",
            success: "is-success",
            helptext: "help"
        }
    }, settings);

    this.validations = $.extend({},{
        number: {
            rules: [
                {
                    regex: /^[0-9]+/,
                    message: 'Not a valid number'
                }
            ]
        },
        float: {
            rules: [
                {
                    regex: /[+-]?([0-9]*[.])?[0-9]+/,
                    message: 'Not a valid float'
                }
            ]
        },
        email: {
            rules: [
                {
                    regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,7}$/,
                    message: 'Not a valid email'
                }
            ]
        },
        url: {
            rules: [
                {
                    regex: /(http(s)?:\/\/)?([\w-]+\.)+[\w-]+[.com]+(\/[/?%&=]*)?/s,
                    message: 'Not a valid URL'
                }
            ]
        },
        strongPassword: {
            rules: [
                {
                    regex: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]+)$/,
                    message: 'Password must contain at least 1 lowercase, 1 uppercase and 1 number'
                },
                {
                    regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]+){8,}$/,
                    message: 'Password must be at least 8 characters long'
                },
                {
                    regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\$%&])([a-zA-Z0-9@#\$%&]+){8,}$/,
                    message: 'Password must contain a special character (@#$%&)'
                }
            ]
        }
    }, validations)

    if(!this.config.form || !$(this.config.form).length) {
        throw new Error('Form selector missing or not found');
        return;
    }

    this.form = $(this.config.form);
    this.elements = this.form.find("input, select, textarea");
    this.successIcon = '<span class="icon is-small is-right has-text-success"><i class="'+this.config.successIcon+'"></i></span>';
    this.errorIcon = '<span class="icon is-small is-right has-text-warning"><i class="'+this.config.errorIcon+'"></i></span>';

    this.setNormal = (el) => {
        el.removeClass(this.config.classes.success)
            .removeClass(this.config.classes.danger)
        
        this.removeIcon(el);
    }

    this.setError = (el,message="",submit=false) => {
        el.removeClass(this.config.classes.success)
            .addClass(this.config.classes.danger)
            .closest(".field").find("." + this.config.classes.helptext).removeClass('is-hidden')

        if(message) {
          el.closest(".field").find("." + this.config.classes.helptext).html(message);
        }
        
        this.removeIcon(el)
        this.addErrorIcon(el)

        if(this.config.scroll && submit) {
            $('html, body').animate({
                scrollTop: $('.control .is-danger').first().offset().top -60
            }, 600, 'swing');
        }
    }

    this.setSuccess = (el) => {
        el.removeClass(this.config.classes.danger)
            .addClass(this.config.classes.success)
            .closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')

        this.removeIcon(el);
        this.addSuccessIcon(el);
    }

    this.checkRequired = (el,submit=false) => {
        let val = el.val();
        if(el.attr('required') && val === '') {
            this.setError(el,this.config.requiredMessage,submit);
            return false;
        }
        return true;
    }

    this.validateField = (el,name,validation,submit=false) => {
        let val = el.val();
        if(typeof val == 'undefined' || val == null) {
            this.setNormal(el);
            return true;
        }
        if(!validations || !validations.length) {
            this.setSuccess(el);
            return true;
        }

        let valid = true;
        validations = validations.split(' ');
        validations.forEach((validation) => {
            if(valid && validation && this.validations[validation] && this.validations[validation].rules && this.validations[validation].rules.length) {
                this.validations[validation].rules.forEach((rule) => {
                    if(valid && rule.regex && !rule.regex.test(val)) {
                        valid = false;
                        this.setError(el,(rule.message || false),submit)
                    }
                });
            }
            if(valid && validation && this.validations[validation] && this.validations[validation].callback) {
                if(this.validations[validation].callback.method.call(val,el,name)) {
                    valid = true;
                } else {
                    valid = false;
                    this.setError(el,(this.validations[validation].callback.message || false),submit)
                }
            }
            if(valid && validation && this.validations[validation] && this.validations[validation].async) {
                this.validations[validation].async.method.call(val,el,name).then((resp) => {
                    valid = true;
                }).catch((err) => {
                    valid = false;
                    this.setError(el,(this.validations[validation].async.message || false),submit)
                })
            }
        });
        if(valid) {
            this.setSuccess(el);
        }
    }

    this.validateCheckRadio = (el,name,submit=false) => {
        $('[name="'+name+'"]').closest('label').removeClass('is-success is-danger');
        if(el.attr('required')) {
            if(!$('[name="'+name+'"]:checked').length) {
                this.setError(el,this.config.requiredMessage,submit);
                $('[name="'+name+'"]:not(:checked)').closest('label').addClass('is-danger').closest(".field").find("." + this.config.classes.helptext).removeClass('is-hidden')
                return false;
            } else {
                $('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')
                return true;
            }
        } else {
            $('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')
            return true;
        }
    }

    this.validate = (el,submit=false) => {
        let validation = el.attr('data-validation');
        let type = el.attr('type');
        let name = el.attr('name')
        let val = el.val();

        if(type == 'radio' || type == 'checkbox') {
            return this.validateCheckRadio(el,name,submit)
        } else {
            let reqCheck = this.checkRequired(el);
            if(!reqCheck) return false;
            return this.validateField(el,name,validation,submit)
        }
    }

    this.validateSection = (section) => {
        if(this.config.sections[section] && this.config.sections[section].length) {
            
            this.form.trigger('validate-section',sectionName,this.config.sections[section]);
            
            let allValid = true;
            this.config.sections[section].forEach((input) => {
                this.form.find('[name="'+input+'"]').each((index, element) => {
                    let $el = $(element);
                    let valid = this.validate($el,true)
                    allValid = allValid && valid;
                });
            })
            if(allValid) {
                this.form.trigger('validate-section-valid',sectionName,this.config.sections[section]);
            } else {
                this.form.trigger('validate-section-failed',sectionName,this.config.sections[section]);
            }
            return allValid;
        } else {
            return true;
        }
    }

    this.validateAll = () => {
        let allValid = true;
        this.elements.each((index, el) => {
            let $el = $(el);
            if($el.length) {
                let valid = this.validate($el,true);
                allValid = valid && allValid;
            }
        });
        return allValid;
    }
    
    this.addErrorIcon = (el) => {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            control.append(this.errorIcon);
        }

    }

    this.addSuccessIcon = (el) => {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            control.append(this.successIcon);
        }
    }
    
    this.removeIcon = (el) => {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            el.siblings(".is-right").remove();
        }
    }

    this.blockType = (e,el) => {
        let keyCode = (event.keyCode ? event.keyCode : event.which);
        if(el.hasClass('only-num')) {
            if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 8) {
                event.preventDefault();
            }
        }
    }

    this.blockPaste = (e,el) => {
        if(el.hasClass('only-num')) {
            setTimeout(() => {
                el.val(el.val().replace(/[^0-9]/g, ''));
            },10)
        }
    }
    
    this.elements.each((index, el) => {
        let $el = $(el);
        $el.on('keydown', (event) => {
          this.blockType(event,$el);
        }).on('paste', (event) => {
          this.blockPaste(event,$el);
        })
        if(!this.config.lazy) {
            $el.on('blur', () => {
                this.checkRequired($el)
            }).on('keyup delete change', () => {
                this.validate($el)
            });
        }
    });
    
    this.form.find("[type=submit]").click((e) => {
        e.preventDefault();
        if(this.validateAll()) {
            this.form.trigger('submit-valid');
            this.form.submit();
        } else {
            this.form.trigger('submit-error');
        }
    })

};