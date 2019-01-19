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
                    <th class="edit" ng-if="accessToken">&nbsp;</th>
                </tr>
                </thead>

                <tbody>
                <tr ng-repeat="song in songs" class="song">
                    <td class="title" title="{{song.title}}">
                        <a href="{{song.url}}" target="_blank">{{song.title}} <span ng-if="song.others"><small><em>({{song.others}})</em></small></span></a>
                    </td>
                    <td class="author" title="{{song.author}}">
                        {{song.author}}
                    </td>
                    <td class="category" title="{{song.category}}">
                        {{song.category}}
                    </td>
                    <td class="edit" ng-if="accessToken">
                        <a href="" ng-click="edit(song.id)" title="Thay Đổi"><i class="glyphicon glyphicon-edit"></i></a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>