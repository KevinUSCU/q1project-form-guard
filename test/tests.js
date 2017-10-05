const expect = chai.expect;

describe('readFormFields', function () {
    it('is a function', function () {
        expect(readFormFields).to.be.a('function');
    });

    var domRef = [
        {
            checked: false,
            value: "hello"
        },
        {
            checked: false,
            value: "friend"
        },
        {
            checked: true,
            value: ""
        }
    ];
    
    var formFields = [
        {
            index: 0,
            checked: "",
            value: ""
        },
        {
            index: 2,
            checked: "",
            value: ""
        }
    ];

    var readTest = [
        {
            index: 0,
            checked: false,
            value: "hello"
        },
        {
            index: 2,
            checked: true,
            value: ""
        }
    ];

    it('should read fields from the DOM which are included in a provided array', function() {
        readFormFields(formFields, domRef);
            console.log(domRef)
    console.log(formFields)
    console.log(readTest)
        expect(formFields).to.deep.equal(readTest);
    })
});



