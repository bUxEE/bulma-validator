# bulma-validator
Form validation for Bulma.css

<strong>BulmValidator requires JQuery</strong>

You can set custom validations containing patterns, messages, callback methods and async methods.

<h2>HTML</h2>
Validation is applied to the field through the <strong>data-validation</strong> attribute
```html
<div class="field">
  <label class="label">Phone number</label>
  <div class="control">
    <input class="input only-num" type="text" placeholder="phone number" data-validation="phone" name="phone_number">
  </div>
  <p class="help">This is a help text</p>
</div>
```

<h2>Configruation</h2>
<pre>
const config = {
    form: '#main-form', // form selector
    lazy: true,  // if set to true validation will be executed only when the form is submitted
    scroll: true, // scroll to error
    requiredMessage: 'Required field',
    successIcon: 'fas fa-check',
    errorIcon: 'fas fa-exclamation-triangle',
    sections: { // each section contains an array of field names
        section_1: ["amount"], 
        section_2: ["gender","first_name","last_name","phone_number","email","address","province"]
    }
    classes: { 
        danger: "is-danger", // class applied to input on passed validation
        success: "is-success", // class applied to input on failed validation
        helptext: "help" // selector for validation text
		}
};
</pre>

<h2>Validations</h2>
May contain rules (object array), async (async method), callback (simple method) 
<pre>
const validations = { 
    cell: {
        rules: [
            {
                regex: /^((00|\+)\d{2}[- ]?)?3\d{8,9}$/,
                message: 'Insert a valid phone number'
            }
        ]
    },
    server: {
        async:
            {
                method: serverRequest, //custom method ,
                message: 'Error retrieving data from server'
            }
    },
    address: {
        callback: {
            method: checkAddress, //custom method
            message: 'Select an adress from Google autocomplete options' 
        }
    },
    zip: {
        rules: [
            {
                regex: /^[0-9]{5}/,
                message: 'Invalid Zip code'
            }
        ],
        callback: {
            method: checkZip, //custom method
            message: 'Zip code not present in list' 
        }
    }
};
</pre>

<h2>Initialization</h2>
<pre>
var validator = new BulmaValidator(config,validations);
</pre>

<h2>Helper classes</h2>
<h3 style="margin-bottom: 0">only-num</h3>allows only the input of numbers
```html
<input class="input only-num" type="text">
```


<h2>Methods</h2>
<h3>validateSection</h3>
<pre>
validator.validateSection('section_1');
</pre>

<h2>Events</h2>
All events are triggered on the form element
<h3>submit-valid</h3>
validation passed on form submit
<pre>
validator.form.on('submit-valid',(e) => {
    ...your code here
}) 
</pre>
<h3>submit-error</h3>
validation failed on form submit
<pre>
validator.form.on('submit-error',(e) => {
    ...your code here
}) 
</pre>
<h3>validate-section</h3>
section validation start
<pre>
validator.form.on('validate-section',(e,sectionName,sectionValue) => {
    ...your code here
}) 
</pre>
<h3>validate-section-valid</h3>
<pre>
validator.form.on('validate-section-valid',(e,sectionName,sectionValue) => {
    ...your code here
}) 
</pre>
<h3>validate-section-error</h3>
<pre>
validator.form.on('validate-section-error',(e,sectionName,sectionValue) => {
    ...your code here
}) 
</pre>
