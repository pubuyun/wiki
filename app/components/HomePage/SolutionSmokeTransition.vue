<template>
    <svg
        class="solution-smoke-transition block size-full overflow-visible"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
    >
        <!--
            Both closed silhouettes overlap through the centre. Their upper
            and lower contours are made only from curves, so the travelling
            wipe never exposes a straight SVG edge or a seam between colours.
        -->
        <g data-solution-smoke-cloud="blue">
            <path
                d="M-280 150C-150 26 42 18 157 143C258 4 432 30 501 168C614 68 791 105 839 270C952 302 1012 426 960 542C925 620 873 653 814 669C904 755 893 878 786 936C675 998 553 950 497 850C414 975 260 958 206 830C99 925-63 858-101 719C-221 760-335 657-282 520C-402 426-380 254-280 150Z"
                fill="#3d82da"
            />
            <path
                d="M-305 412C-180 329-45 379-11 504C95 433 251 485 278 624C392 548 552 600 580 741C684 673 818 709 872 824C910 905 887 981 814 1031C699 1110 561 1040 510 932C423 1047 264 1029 208 899C101 986-63 927-109 788C-229 821-340 720-300 590C-360 535-363 462-305 412Z"
                fill="#438cdf"
            />
        </g>

        <g data-solution-smoke-cloud="orange">
            <path
                d="M642 271C687 116 854 69 968 164C1053 5 1258-23 1370 119C1491 15 1680 57 1732 219C1860 197 1949 343 1873 470C1947 592 1874 742 1738 762C1783 886 1664 984 1534 930C1452 1046 1282 1016 1227 878C1116 973 955 914 927 771C789 817 647 713 681 568C557 505 550 352 642 271Z"
                fill="#ffb142"
            />
            <path
                d="M704 545C806 454 953 487 1005 614C1110 526 1264 568 1302 704C1418 623 1576 685 1592 824C1708 768 1843 850 1845 982C1846 1088 1750 1166 1647 1134C1568 1235 1413 1214 1361 1092C1253 1172 1100 1118 1067 981C946 1043 796 967 793 827C668 803 619 645 704 545Z"
                fill="#ffb64d"
            />
        </g>
    </svg>
</template>

<style scoped>
.solution-smoke-transition {
    filter: drop-shadow(0 -0.7rem 0 rgb(2 35 82 / 12%));
}
</style>
