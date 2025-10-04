"use strict";
// Class definition

var KTMaskDemo = function () {

    // private functions
    var demos = function () {
        $('#kt_date_input').mask('00/00/0000', {
            placeholder: "dd/mm/yyyy"
        });

        $('#kt_time_input').mask('00:00:00', {
            placeholder: "hh:mm:ss"
        });

        $('#kt_date_time_input').mask('00/00/0000 00:00:00', {
            placeholder: "dd/mm/yyyy hh:mm:ss"
        });

        $('#kt_cep_input').mask('00000-000', {
            placeholder: "99999-999"
        });
        $('#kt_cep_input2').mask('00000', {
            placeholder: "12345"
        });

        $('#kt_phone_input').mask('0000-0000', {
            placeholder: "9999-9999"
        });

        $('#kt_phone_with_ddd_input').mask('(00) 000-0000000', {
            placeholder: "(99) 999-9999999"
        });
        $('#kt_phone_with_ddd_input2').mask('(00) 000-0000000', {
            placeholder: "(99) 999-9999999"
        });
        $('#kt_phone_with_ddd_input3').mask('(00) 000-0000000', {
            placeholder: "(99) 999-9999999"
        });
        $('#kt_phone_with_ddd_input4').mask('(00) 000-0000000', {
            placeholder: "(99) 999-9999999"
        });

        $('#kt_cpf_input').mask('000.000.000-00', {
            reverse: true
        });

        $('#kt_cnpj_input').mask('00.000.000/0000-00', {
            reverse: true
        });

        $('#kt_money_input').mask('000.000.000.000.000,00', {
            reverse: true
        });
        $('#kt_money_input_usa3').mask('000,000,000,000,000', {
            reverse: true
        });
        $('#kt_money_input_usa3').on('blur', function() {
            var value = $(this).val();

            // Check if the value contains a decimal point
            if (value.indexOf('.') === -1) {
                // If no decimal point, add '.00' at the end
                $(this).val(value + '.00');
            } else {
                // Ensure there are exactly two decimal places
                var parts = value.split('.');
                if (parts[1].length === 1) {
                    $(this).val(value + '0');
                }
            }
        });
        
       

        $('#kt_money_input_usa2').mask('000,000,000,000,000', {
            reverse: true
        });
        $('#kt_money_input_usa2').on('blur', function() {
            var value = $(this).val();

            // Check if the value contains a decimal point
            if (value.indexOf('.') === -1) {
                // If no decimal point, add '.00' at the end
                $(this).val(value + '.00');
            } else {
                // Ensure there are exactly two decimal places
                var parts = value.split('.');
                if (parts[1].length === 1) {
                    $(this).val(value + '0');
                }
            }
        });

        $('#kt_money_input_usa1').mask('000,000,000,000,000', {
            reverse: true
        });
        $('#kt_money_input_usa1').on('blur', function() {
            var value = $(this).val();

            // Check if the value contains a decimal point
            if (value.indexOf('.') === -1) {
                // If no decimal point, add '.00' at the end
                $(this).val(value + '.00');
            } else {
                // Ensure there are exactly two decimal places
                var parts = value.split('.');
                if (parts[1].length === 1) {
                    $(this).val(value + '0');
                }
            }
        });

        $('#kt_money2_input').mask("#.##0,00", {
            reverse: true
        });

        $('#kt_percent_input').mask('##0,00%', {
            reverse: true
        });

        $('#kt_clear_if_not_match_input').mask("00/00/0000", {
            clearIfNotMatch: true
        });
    }

    return {
        // public functions
        init: function() {
            demos();
        }
    };
}();

jQuery(document).ready(function() {
    KTMaskDemo.init();
});
