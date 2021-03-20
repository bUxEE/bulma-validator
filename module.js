import { $ as $$, addClass, removeClass, hasClass, val, append, closest, html, find, on, attr, trigger, submit, each, animate } from 'dom7';

$$.fn.addClass = addClass;
$$.fn.removeClass = removeClass;
$$.fn.hasClass = hasClass;
$$.fn.val = val;
$$.fn.append = append;
$$.fn.closest = closest;
$$.fn.html = html;
$$.fn.find = find;
$$.fn.on = on;
$$.fn.attr = attr;
$$.fn.trigger = trigger;
$$.fn.submit = submit;
$$.fn.each = each;
$$.fn.animate = animate;


export default {

    constructor(settings={},validations={}) {

        if(!settings.form || !$$(settings.form).length) {
            throw new Error('Form selector missing or element not found');
            return;
        }
        
        this.config = Object.assign({}, {
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

        this.validations = Object.assign({}, {
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
                        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,7}$$/,
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
                        regex: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]+)$$/,
                        message: 'Password must contain at least 1 lowercase, 1 uppercase and 1 number'
                    },
                    {
                        regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]+){8,}$$/,
                        message: 'Password must be at least 8 characters long'
                    },
                    {
                        regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\$$%&])([a-zA-Z0-9@#\$$%&]+){8,}$$/,
                        message: 'Password must contain a special character (@#$$%&)'
                    }
                ]
            }
        }, validations)
        
        this.form = $$(this.config.form);
        this.elements = this.form.find("input, select, textarea");
        this.successIcon = '<span class="icon is-small is-right has-text-success"><i class="'+this.config.successIcon+'"></i></span>';
        this.errorIcon = '<span class="icon is-small is-right has-text-warning"><i class="'+this.config.errorIcon+'"></i></span>';

        this.init();
    },

    setNormal(el) {
        el.removeClass(this.config.classes.success)
            .removeClass(this.config.classes.danger)
        
        this.removeIcon(el);
    },

    setError(el,message="",submit=false) {
        el.removeClass(this.config.classes.success)
            .addClass(this.config.classes.danger)
            .closest(".field").find("." + this.config.classes.helptext).removeClass('is-hidden')

        if(message) {
          el.closest(".field").find("." + this.config.classes.helptext).html(message);
        }
        
        this.removeIcon(el)
        this.addErrorIcon(el)

        if(this.config.scroll && submit) {
            $$('html, body').animate({
                scrollTop: $$('.control .is-danger').first().offset().top -60
            }, 600, 'swing');
        }
    },

    setSuccess(el) {
        el.removeClass(this.config.classes.danger)
            .addClass(this.config.classes.success)
            .closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')

        this.removeIcon(el);
        this.addSuccessIcon(el);
    },

    checkRequired(el,submit=false) {
        let val = el.val();
        if(el.attr('required') && val === '') {
            this.setError(el,this.config.requiredMessage,submit);
            return false;
        }
        return true;
    },

    validateField(el,name,validation,submit=false) {
        let val = el.val();
        if(typeof val !== 'undefined' && val !== null) {
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
                if(this.validations[validation].callback.method.call(val,el,name)) {
                    return true;
                } else {
                    this.setError(el,(this.validations[validation].callback.message || false),submit)
                    return false;
                }
            }
            if(validation && this.validations[validation] && this.validations[validation].async) {
                this.validations[validation].async.method.call(val,el,name).then((resp) => {
                    return true;
                }).catch((err) => {
                    this.setError(el,(this.validations[validation].async.message || false),submit)
                    return false;
                })
            }
            this.setSuccess(el);
            return true;
        } else {
            this.setNormal(el);
            return true;
        }
    },

    validateCheckRadio(el,name,submit=false) {
        $$('[name="'+name+'"]').closest('label').removeClass('is-success is-danger');
        if(el.attr('required')) {
            if(!$$('[name="'+name+'"]:checked').length) {
                this.setError(el,this.config.requiredMessage,submit);
                $$('[name="'+name+'"]:not(:checked)').closest('label').addClass('is-danger').closest(".field").find("." + this.config.classes.helptext).removeClass('is-hidden')
                return false;
            } else {
                $$('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')
                return true;
            }
        } else {
            $$('[name="'+name+'"]:checked').closest('label').addClass('is-success').closest(".field").find("." + this.config.classes.helptext).addClass('is-hidden')
            return true;
        }
    },

    validate(el,submit=false) {
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
    },

    validateSection(section) {
        if(this.config.sections[section] && this.config.sections[section].length) {
            
            this.form.trigger('validate-section',sectionName,this.config.sections[section]);
            
            let allValid = true;
            this.config.sections[section].forEach((input) => {
                this.form.find('[name="'+input+'"]').each((index, element) => {
                    let $$el = $$(element);
                    let valid = this.validate($$el,true)
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
    },

    validateAll() {
        let allValid = true;
        this.elements.each((index, el) => {
            let $$el = $$(el);
            if($$el.length) {
                let valid = this.validate($$el,true);
                allValid = valid && allValid;
            }
        });
        return allValid;
    },
    
    addErrorIcon(el) {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            control.append(this.errorIcon);
        }

    },

    addSuccessIcon(el) {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            control.append(this.successIcon);
        }
    },
    
    removeIcon(el) {
        let control = el.closest('.control');
        if(control.hasClass("has-icons-right validation-icons")){
            el.siblings(".is-right").remove();
        }
    },

    blockType(e,el) {
        let keyCode = (event.keyCode ? event.keyCode : event.which);
        if(el.hasClass('only-num')) {
            if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 8) {
                event.preventDefault();
            }
        }
    },

    blockPaste(e,el) {
        if(el.hasClass('only-num')) {
            setTimeout(() => {
                el.val(el.val().replace(/[^0-9]/g, ''));
            },10)
        }
    },
       
    init() {
        this.elements.each((index, el) => {
            let elem = $$(el);
            elem.on('keydown', (event) => {
              this.blockType(event,elem);
            }).on('paste', (event) => {
              this.blockPaste(event,elem);
            })
            if(!this.config.lazy) {
                elem.on('blur', () => {
                    this.checkRequired(elem)
                }).on('keyup delete change', () => {
                    this.validate(elem)
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
    }

}