<div>
    <div class="loader" data-loading></div>

    <div class="content">
        <div class="create" ng-if="accessToken">
            <a href="" ng-click="create()" title="Soạn Lịch"><i class="glyphicon glyphicon-new-window"></i></a>
        </div>

        <div ng-repeat="schedule in schedules" class="schedule">
            <div class="date">
                {{schedule.date}}
            </div>

            <div class="liturgy">
                {{schedule.liturgy.name}} - {{schedule.liturgy.year}}
                <a href="" ng-click="edit($index)" title="Thay Đổi Lịch" class="edit" ng-if="accessToken"><i class="glyphicon glyphicon-edit"></i></a>
                <a href="" ng-click="remove($index)" title="Xoá Lịch" class="delete" ng-if="accessToken"><i class="glyphicon glyphicon-remove"></i></a>

                <div class="liturgy other" ng-if="schedule.liturgy.other">
                    <div class="date">&nbsp;</div>
                    {{schedule.liturgy.other}}
                </div>
            </div>

            <div ng-repeat="song in schedule.songs">
                <div class="category">{{song.category}}</div>
                <div class="song">
                    <a href="{{song.url}}" target="_blank" title="{{song.title}}">{{song.title}} (<em>{{song.author}}</em>)</a>
                    <a href="{{song.audio}}" title="Nghe Bài Hát" class="audio" ng-if="song.audio" target="_blank"><i class="glyphicon glyphicon-music"></i></a>
                </div>
                <div class="singer" ng-if="song.singer">Solo: {{song.singer}}</div>
            </div>
        </div>
    </div>
</div>
