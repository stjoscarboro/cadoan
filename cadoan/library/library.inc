<div>
    <div class="loader" data-loading></div>

    <div class="content ng-hide">
        <div class="panel-body">
            <table class="table table-bordered bordered table-striped datatable" data-page-length='10'>
                <thead>
                <tr class="song header">
                    <th class="title">Bài Nhạc</th>
                    <th class="author">Tác Giả</th>
                    <th class="category">Thể Loại</th>
                    <th class="edit">&nbsp;</th>
                </tr>
                </thead>

                <tbody>
                <tr ng-repeat="song in songs" class="song">
                    <td class="title" title="{{song.title}}">
                        <a href="{{song.url}}" target="_blank">{{song.title}} <span ng-if="song.others"><small><em>({{song.others}})</em></small></span></a>
                    </td>
                    <td class="author" title="{{song.author}}">
                        <a href="" ng-click="search(song.author)">{{song.author}}</a>
                    </td>
                    <td class="category" title="{{song.category}}">
                        <a href="" ng-click="search(song.category)">{{song.category}}</a>
                    </td>
                    <td class="edit" title="Thay Đổi">
                        <a href="" ng-click="edit(song.id)"><i class="glyphicon glyphicon-edit"></i></a>
                    </td>

                    <td class="hidden">{{song.name}} | {{song.title}} | {{song.author}} | {{song.category}} | {{song.others}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>