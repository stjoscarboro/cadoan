/**
 * Accent neutralise
 */
(function () {

    function neutralize(data) {
        return data
            .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
            .replace(/[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]/g, 'A')
            .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
            .replace(/[ÉÈẺẼẸÊẾỀỂỄỆ]/g, 'E')
            .replace(/[íìỉĩị]/g, 'i')
            .replace(/[ÍÌỈĨỊ]/g, 'I')
            .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
            .replace(/[ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]/g, 'O')
            .replace(/[úùủũụưứừửữự]/g, 'u')
            .replace(/[ÚÙỦŨỤƯỨỪỬỮỰ]/g, 'U')
            .replace(/[ýỳỷỹỵ]/g, 'y')
            .replace(/[ÝỲỶỸỴ]/g, 'Y')
            .replace(/[đ]/g, 'd')
            .replace(/[Đ]/g, 'D')
            ;
    }

    let searchType = $.fn.DataTable.ext.type.search;

    searchType.string = function (data) {
        return !data ? '' : typeof data === 'string' ? neutralize(data) : data;
    };

    searchType.html = function (data) {
        data = data.replace(/<.*?>/g, '');
        return !data ? '' : typeof data === 'string' ? neutralize(data) : data;
    };

}());
