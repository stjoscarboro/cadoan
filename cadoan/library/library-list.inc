<div>
    <div class="loader" data-loading></div>

    <div class="content ng-hide">
        <div class="search">
            <input class="form-control" type="text" placeholder="Search" aria-label="Search">
        </div>

        <div ng-repeat="song in songs.slice((pageCounter - 1) * pageSize, pageCounter * pageSize)" class="counter">
            <div class="song">
                <div class="title">
                    <span class="label">Tên Bài Hát</span> <a href="{{song.url}}" target="_blank" title="{{song.title}}">{{song.title}}</a>
                    <a href="{{song.audio}}" ng-if="song.audio" target="_blank" title="Nghe Bài Hát"><i class="glyphicon glyphicon-music audio"></i></a>
                    <span ng-if="song.others">
                    <span class="hidden">{{song.others}}</span>
                </span>
                </div>

                <div class="author">
                    <span class="label">Tác Giả</span> <a href="" ng-click="search(song.author)" title="{{song.author}}">{{song.author}}</a>
                </div>

                <div class="category">
                    <span class="label">Thể Loại</span> <a href="" ng-click="search(song.category)" title="{{song.category}}">{{song.category}}</a>
                </div>
            </div>
        </div>

        <div uib-pagination ng-model="pageCounter" total-items="songs.length" items-per-page="pageSize" max-size="maxSize" class="pagination-sm pull-right"></div>
    </div>
</div>
