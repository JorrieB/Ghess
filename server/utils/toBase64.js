// toBase64 utility function
// Converts a number to base 64

var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

module.exports = function(number) {
    var num = number;
    var remainder;
    var output = [];
    while (num > 0) {
        remainder = num % 64;
        num = (num - remainder) / 64;
        output.unshift(digits.charAt(remainder));
    }
    return output.join('');
};
