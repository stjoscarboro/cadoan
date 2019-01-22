<div>
    <div class="loader" data-loading></div>

    <div>
        <div ng-repeat="schedule in schedules" class="schedule">
            <div class="date">
                {{schedule.date}}
            </div>

            <div class="liturgy">
                {{schedule.liturgy}}
                <a href="#top" ng-click="edit($index)" title="Thay Đổi Lịch" class="edit" ng-if="accessToken"></a>
                <a href="" ng-click="remove($index)" title="Xoá Lịch" class="delete" ng-if="accessToken"></a>
            </div>

            <div ng-repeat="song in schedule.songs">
                <div class="category">{{song.category}}</div>
                <div class="song">
                    <a href="{{song.url}}" target="_blank" title="{{song.title}}">{{song.title}} (<em>{{song.author}}</em>)</a>
                    <a href="{{song.audio}}" target="_blank" class="audio" title="Nghe Bài Hát" ng-if="song.audio"></a>
                </div>
                <div class="singer" ng-if="song.singer">Solo: {{song.singer}}</div>
            </div>
        </div>
    </div>
</div>
