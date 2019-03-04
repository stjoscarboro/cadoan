<div>
    <div class="loader" data-loading></div>

    <div class="content" ng-if="!loading">
        <div class="create" ng-if="accessToken">
            <a href="" ng-click="create()" title="Soạn Lịch"><i class="glyphicon glyphicon-new-window"></i></a>
        </div>

        <div ng-repeat="schedule in schedules" class="schedule">
            <div class="date">
                {{schedule.date}}
            </div>

            <div class="liturgy">
                {{(liturgies | filter: {'id': schedule.liturgy.id})[0].name}} - {{(years | filter: {'id': schedule.liturgy.year})[0].name}}
                <a href="" ng-click="edit($index)" title="Thay Đổi Lịch" ng-if="accessToken"><i class="glyphicon glyphicon-edit edit"></i></a>
                <a href="" ng-click="remove($index)" title="Xoá Lịch" ng-if="accessToken"><i class="glyphicon glyphicon-remove delete"></i></a>

                <div class="liturgy special" ng-if="schedule.liturgy.special">
                    <div class="date">&nbsp;</div>
                    {{schedule.liturgy.special}}
                </div>
            </div>

            <div ng-repeat="song in schedule.songs">
                <div class="category">{{song.category}}</div>
                <div class="song">
                    <a href="{{song.url}}" target="_blank" title="{{song.title}}">{{song.title}} (<em>{{song.author}}</em>)</a>
                    <a href="{{song.audio}}" title="Nghe Bài Hát" ng-if="song.audio" target="_blank"><i class="glyphicon glyphicon-music audio"></i></a>
                </div>
                <div class="singer" ng-if="song.singer">Solo: {{(singers | filter: {'id': song.singer})[0].name}}</div>
            </div>
        </div>
    </div>
</div>
