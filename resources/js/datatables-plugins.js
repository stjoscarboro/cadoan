/**
 * Accent neutralise
 */
(function () {

    function removeAccents(data) {
        return data
            .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
            .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
            .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
            .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
            .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
            .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
            .replace(/đ|Đ/g, 'd')
            ;
    }

    var searchType = jQuery.fn.DataTable.ext.type.search;

    searchType.string = function (data) {
        return !data ?
            '' :
            typeof data === 'string' ?
                removeAccents(data) :
                data;
    };

    searchType.html = function (data) {
        return !data ?
            '' :
            typeof data === 'string' ?
                removeAccents(data.replace(/<.*?>/g, '')) :
                data;
    };

}());


/**
 * intl
 */
(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], function ($) {
            return factory($, window, document);
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }

            if (!$) {
                $ = typeof window !== 'undefined' ?
                    require('jquery') :
                    require('jquery')(root);
            }

            return factory($, root, root.document);
        };
    } else {
        // Browser
        factory(jQuery, window, document);
    }
}
(function ($, window, document) {

    $.fn.dataTable.ext.order.intl = function (locales, options) {
        if (window.Intl) {
            var collator = new Intl.Collator(locales, options);
            var types = $.fn.dataTable.ext.type;

            delete types.order['string-pre'];
            types.order['string-asc'] = collator.compare;
            types.order['string-desc'] = function (a, b) {
                return collator.compare(a, b) * -1;
            };
        }
    };

}));
