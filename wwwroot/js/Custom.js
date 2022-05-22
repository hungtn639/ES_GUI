function GetIndexes(showAlert) {
    $.ajax({
        type: 'GET',
        url: '/Home/GetIndexes',
        data: {},
        processData: false,
        contentType: false
    }).done(function (response) {
        $('#query').val('');
        var htmlString = '';
        for (i = 0; i < response.data.length; i++) {
            htmlString += '<tr>';
            htmlString += '<td>' + response.data[i]["index"] + '</td>';
            htmlString += '<td>' + response.data[i]["status"] + '</td>';
            htmlString += '<td>' + response.data[i]["health"] + '</td>';
            htmlString += '<td>' + response.data[i]["docs.count"] + '</td>';
            htmlString += '<td>' + response.data[i]["store.size"] + '</td>';
            htmlString += '<td>';
            htmlString += '<button type="button" class="btn btn-primary" onclick="openDocumentPage(\'' + response.data[i]["index"] + '\')"><span class="glyphicon glyphicon-file"></span></button>';
            htmlString += '&#160;&#160;';
            htmlString += '<button type="button" class="btn btn-primary" onclick="showOpenFileDialog(\'' + response.data[i]["index"] + '\')"><span class="glyphicon glyphicon-open"></span></button>';
            htmlString += '&#160;&#160;';
            htmlString += '<button type="button" class="btn btn-danger" onclick="DeleteIndex(\'' + response.data[i]["index"] + '\')"><span class="glyphicon glyphicon-trash"></span></button>';
            htmlString += '</td>';
            htmlString += '</tr>';
        }
        $("#tbody-index").html(htmlString);
        if (showAlert) {
            $("#alert-success").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-success").slideUp(2000);
            });
        }
    });
}

function DeleteIndex(index) {
    var formData = new FormData();
    formData.append("index", index);
    $.ajax({
        type: 'POST',
        url: '/Home/DeleteIndex',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        if (response.data == "success") {
            GetIndexes(true);
        } else {
            $("#alert-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-error").slideUp(2000);
            });
        }
    });
}

function CreateIndex(index) {
    if (!index) {
        return;
    }
    var formData = new FormData();
    formData.append("index", index);
    $.ajax({
        type: 'POST',
        url: '/Home/CreateIndex',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        $('#index').val('');
        $('#create-modal').modal('hide');
        if (response.data == "success") {
            GetIndexes(true);
        } else {
            $("#alert-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-error").slideUp(2000);
            });
        }
    });
}

function openDocumentPage(index) {
    window.open('/Home/Document?index=' + index);
}

function GetDocuments(index, showAlert) {
    var formData = new FormData();
    formData.append("index", index);
    $.ajax({
        type: 'POST',
        url: '/Home/GetDocuments',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        if (response.data.length > 0) {
            GenerateFieldTableDocument(response.data[0]);
            GenerateRowTableDocument(response.data);
        } else {
            $("#thead-document").html('');
            $("#tbody-document").html('');
        }
        if (showAlert) {
            $("#alert-success").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-success").slideUp(2000);
            });
        }
    });
}

function showOpenFileDialog(index) {
    $("#indexAddDocuments").val(index);
    $('#addDocument-modal').modal('show');
}

function AddDocuments() {
    if (!$("#indexAddDocuments").val()) {
        return;
    }
    var fileExtension = ['json'];
    var filename = $('#file').val();
    if (filename.length == 0) {
        return;
    } else {
        var extension = filename.replace(/^.*\./, '');
        if ($.inArray(extension, fileExtension) == -1) {
            return;
        }
    }
    var formData = new FormData();
    var fileUpload = $("#file").get(0);
    var files = fileUpload.files;
    formData.append(files[0].name, files[0]);
    formData.append("index", $("#indexAddDocuments").val());
    $.ajax({
        type: "POST",
        url: "/Home/AddDocuments",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("XSRF-TOKEN",
                $('input:hidden[name="__RequestVerificationToken"]').val());
        },
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        $('#file').val('');
        $('#addDocument-modal').modal('hide');
        if (response.data == "success") {
            GetIndexes(true);
        } else {
            $("#alert-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-error").slideUp(2000);
            });
        }
    });
}

function DeleteDocument(index, id) {
    var formData = new FormData();
    formData.append("index", index);
    formData.append("id", id);
    $.ajax({
        type: 'POST',
        url: '/Home/DeleteDocument',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        if (response.data == "success") {
            GetDocuments(index, true);
        } else {
            $("#alert-error").fadeTo(2000, 500).slideUp(500, function () {
                $("#alert-error").slideUp(2000);
            });
        }
    });
}

function GenerateFieldTableDocument(document) {
    var fields = Object.keys(document._source);
    var htmlString = '';
    htmlString += '<tr>';
    for (i = 0; i < fields.length; i++) {
        htmlString += '<th style="text-transform:uppercase">' + fields[i] + '</th>';
    }
    htmlString += '<th style="width:80px;text-transform:uppercase">Action</th>';
    htmlString += '</tr>';
    $("#thead-document").html(htmlString);
}

function GenerateRowTableDocument(documents) {
    var fields = Object.keys(documents[0]._source);
    var htmlString = '';
    for (i = 0; i < documents.length; i++) {
        var document = documents[i];
        htmlString += '<tr>';
        for (j = 0; j < fields.length; j++) {
            htmlString += '<td>' + document._source[fields[j]] + '</td>';
        }
        htmlString += '<td>';
        htmlString += '<button type="button" class="btn btn-danger" onclick="DeleteDocument(\'' + document._index + '\', \'' + document._id + '\')"><span class="glyphicon glyphicon-trash"></span></button>';
        htmlString += '</td>';
        htmlString += '</tr>';
    }
    $("#tbody-document").html(htmlString);
}

function SearchDocuments(index, query) {
    if (!query) {
        GetDocuments(index, false);
    } else {
        var listFieldSearch = '';
        $('input[type=checkbox]').each(function () {
            var fieldName = (this.checked ? $(this).val() : '');
            if (fieldName != '') {
                listFieldSearch += (listFieldSearch == '' ? fieldName : ',' + fieldName);
            }
        });
        var operatorSearch = $('input[name="rdOperator"]:checked').val();
        var formData = new FormData();
        formData.append("index", index);
        formData.append("query", query);
        formData.append("listFieldSearch", listFieldSearch);
        formData.append("operatorSearch", operatorSearch);
        $.ajax({
            type: 'POST',
            url: '/Home/SearchDocuments',
            data: formData,
            processData: false,
            contentType: false
        }).done(function (response) {
            if (response.data.length > 0) {
                GenerateFieldTableDocument(response.data[0]);
                GenerateRowTableDocument(response.data);
            } else {
                $("#thead-document").html('');
                $("#tbody-document").html('');
            }
        });
    }
}

function GenerateFieldSearch(index) {
    var formData = new FormData();
    formData.append("index", index);
    $.ajax({
        type: 'POST',
        url: '/Home/GetDocuments',
        data: formData,
        processData: false,
        contentType: false
    }).done(function (response) {
        if (response.data.length > 0) {
            var document = response.data[0];
            var fields = Object.keys(document._source);
            var htmlString = '';
            var checkboxId;
            var checkboxValue;
            var checkboxText;
            for (i = 0; i < fields.length; i++) {
                if (fields[i].toUpperCase() != 'ID') {
                    checkboxId = 'chk_' + fields[i];
                    checkboxValue = fields[i];
                    checkboxText = fields[i].toUpperCase();
                    htmlString += '<div class="form-check-inline"><label class="form-check-label" for="' + checkboxId + '"><input type="checkbox" class="form-check-input" id="' + checkboxId + '" value="' + checkboxValue + '">' + checkboxText + '</label></div>';
                }
            }
            $("#field_search").html(htmlString);
        } else {
            $("#field_search").html('');
            $("#field_search").hide();
            $("#operator_search").hide();
        }
    });
}