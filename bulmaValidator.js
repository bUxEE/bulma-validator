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
                    regex: /^[0-9.]+/,
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
            .closest(".field").find("." + this.config.classes.helptext).removeClass('hidden')

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
            .closest(".field").find("." + this.config.classes.helptext).addClass('hidden')

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
        if(val.length) {
            if(validation && this.validations[validation] && this.validations[validation].rules && this.validations[validation].rules.length) {
                let valid = this.validations[validation].rules.every((rule) => {
                    if(rule.regex && !rule.regex.test(val)) {
                        this.setError(el,(rule.message || false),submit)
                        return false;
                    }
                    return true;
                });
                if(!valid) {
                    return false;
                }

            }
            if(validation && this.validations[validation] && this.validations[validation].callback) {
                if(this.validations[validation].callback.method.call(val)) {
                    return true;
                } else {
                    this.setError(el,(this.validations[validation].callback.message || false),submit)
                    return false;
                }
            }
            if(validation && this.validations[validation] && this.validations[validation].ajax) {
                this.validations[validation].ajax.method.call(val).then((resp) => {
                    return true;
                }).catch((err) => {
                    this.setError(el,(this.validations[validation].ajax.message || false),submit)
                    return false;
                })
            }
            this.setSuccess(el);
            return true;
        } else {
            this.setNormal(el);
            return true;
        }
    }

    this.validateCheckRadio = (el,name,submit=false) => {
        $('[name="'+name+'"]').closest('label').removeClass('is-success is-danger');
        if(el.attr('required')) {
            if(!$('[name="'+name+'"]:checked').length) {
                this.setError(el,this.config.requiredMessage,submit);
                $('[name="'+name+'"]:not(:checked)').closest('label').addClass('is-danger').closest(".field").find("." + this.config.classes.helptext).removeClass('hidden')
                return false;
            } else {
                $('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('hidden')
                return true;
            }
        } else {
            $('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('hidden')
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
            let allValid = true;
            this.config.sections[section].forEach((input) => {
                this.form.find('[name="'+input+'"]').each((index, element) => {
                    let $el = $(element);
                    let valid = this.validate($el,true)
                    allValid = allValid && valid;
                });
            })
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
        switch(true) {
            case el.hasClass('only-num'):
                if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 8) {
                    event.preventDefault();
                }
                break;
            case el.hasClass('only-float'):
                if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 8 && keyCode !== 190) {
                    event.preventDefault();
                }
                break;
            case el.hasClass('phone-num'):
                if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 8 && keyCode !== 187) {
                    console.log("fsdf")
                    event.preventDefault();
                }
                break;
        }
    }

    this.blockPaste = (e,el) => {
        switch(true) {
            case el.hasClass('only-num'):
                setTimeout(() => {
                    el.val(el.val().replace(/[^0-9]/g, ''));
                },100)
                break;
            case el.hasClass('only-float'):
                setTimeout(() => {
                    el.val(el.val().replace(/[^0-9\.]/g, ''));
                },100)
                break;
            case el.hasClass('phone-num'):
                setTimeout(() => {
                    el.val(el.val().replace(/[^0-9\+]/g, ''));
                },100)
                break;
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
            this.form.submit();
        }
    })

    return this;
};


if (typeof exports === 'object') {
    module.exports.bulmaValidator = BulmaValidator;
}
 