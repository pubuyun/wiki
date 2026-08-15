<script setup lang="ts">
import { useId } from "vue";

const componentId = useId().replaceAll(":", "");
const sunsetGradientId = `product-wave-sunset-${componentId}`;
const softEdgeGradientId = `product-wave-soft-edge-${componentId}`;
const exitSoftEdgeGradientId = `product-wave-exit-soft-edge-${componentId}`;
const maskNames = ["background", "warm", "blue", "lower", "right"] as const;
const maskIds = Object.fromEntries(
    maskNames.map((name) => [name, `product-wave-mask-${name}-${componentId}`]),
) as Record<(typeof maskNames)[number], string>;
</script>

<template>
    <svg
        class="product-wave-transition"
        viewBox="0 0 1776 999"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
        aria-hidden="true"
    >
        <defs>
            <linearGradient
                :id="sunsetGradientId"
                gradientUnits="userSpaceOnUse"
                x1="835"
                y1="0"
                x2="1776"
                y2="0"
            >
                <stop offset="0" stop-color="#ffdb69" />
                <stop offset="0.24" stop-color="#ffaf45" />
                <stop offset="0.48" stop-color="#ef6793" />
                <stop offset="1" stop-color="#ef6793" />
            </linearGradient>

            <linearGradient
                :id="softEdgeGradientId"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
            >
                <stop offset="0" stop-color="#fff" stop-opacity="1" />
                <stop offset="0.28" stop-color="#fff" stop-opacity="0.96" />
                <stop offset="0.72" stop-color="#fff" stop-opacity="0.35" />
                <stop offset="1" stop-color="#fff" stop-opacity="0" />
            </linearGradient>

            <linearGradient
                :id="exitSoftEdgeGradientId"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
            >
                <stop offset="0" stop-color="#fff" stop-opacity="0" />
                <stop offset="0.28" stop-color="#fff" stop-opacity="0.35" />
                <stop offset="0.72" stop-color="#fff" stop-opacity="0.96" />
                <stop offset="1" stop-color="#fff" stop-opacity="1" />
            </linearGradient>

            <mask
                v-for="name in maskNames"
                :id="maskIds[name]"
                :key="name"
                x="-220"
                y="-80"
                width="2300"
                height="1160"
                maskUnits="userSpaceOnUse"
            >
                <rect
                    :data-product-wave-mask-solid="name"
                    x="-220"
                    y="-80"
                    width="0"
                    height="1160"
                    fill="#fff"
                />
                <rect
                    :data-product-wave-mask-edge="name"
                    x="-220"
                    y="-80"
                    width="150"
                    height="1160"
                    :fill="`url(#${softEdgeGradientId})`"
                />
                <rect
                    :data-product-wave-mask-exit-edge="name"
                    x="-370"
                    y="-80"
                    width="150"
                    height="1160"
                    :fill="`url(#${exitSoftEdgeGradientId})`"
                />
            </mask>
        </defs>

        <g data-product-wave-artwork>
            <g :mask="`url(#${maskIds.background})`">
                <rect width="1776" height="999" fill="#07366f" />
            </g>

            <!-- Warm line caught between the two blue currents. -->
            <g :mask="`url(#${maskIds.warm})`">
                <path
                    fill="#ffb348"
                    d="M0 292C220 289 416 308 574 395C704 466 778 522 900 470C1017 420 1094 528 1232 579C1408 644 1560 598 1776 421V477C1577 625 1418 657 1248 624C1084 592 1025 489 912 501C779 515 701 478 570 416C401 336 211 345 0 367Z"
                />
            </g>

            <!-- Main blue ribbon. -->
            <g :mask="`url(#${maskIds.blue})`">
                <path
                    fill="#3775c6"
                    d="M0 350C262 318 486 350 660 430C815 501 896 594 1002 630C1115 668 1212 602 1322 548C1215 638 1113 692 996 694C858 696 775 592 628 512C450 415 238 421 0 492Z"
                />
                <path
                    fill="#2f70bd"
                    d="M0 351C244 322 475 349 651 429C785 490 875 584 982 625C1071 659 1146 624 1238 582C1139 664 1051 689 954 657C821 613 726 520 586 469C417 408 234 414 0 461Z"
                    opacity="0.82"
                />
                <path
                    fill="#56a4e2"
                    d="M0 432C242 393 462 415 644 492C805 560 886 655 1008 682C1138 711 1262 627 1432 520C1281 647 1198 722 1081 750C936 784 826 682 680 585C504 468 281 436 0 501Z"
                    opacity="0.84"
                />
            </g>

            <!-- Lower-left layered ribbons. -->
            <g :mask="`url(#${maskIds.lower})`">
                <path
                    fill="#ef6793"
                    d="M0 718C171 710 278 656 385 579C485 507 553 478 643 504C727 529 775 590 866 625C770 610 703 559 624 540C533 519 470 550 380 615C276 691 175 726 0 731Z"
                />
                <path
                    fill="#ffffff"
                    d="M0 724C164 714 271 669 378 597C480 528 548 507 626 535C698 561 757 602 837 627C753 615 690 577 619 559C535 538 474 568 384 633C281 707 178 746 0 769Z"
                />
                <path
                    fill="#ffdc70"
                    d="M0 769C177 733 278 719 380 645C475 576 535 546 620 554C702 562 761 605 837 627C748 615 688 585 621 601C540 621 484 702 375 791C272 875 157 942 0 976Z"
                />
            </g>

            <!-- Right-hand ribbons and their small detached droplet. -->
            <g :mask="`url(#${maskIds.right})`">
                <path
                    :fill="`url(#${sunsetGradientId})`"
                    d="M835 438C978 508 1065 568 1190 586C1344 608 1417 560 1510 482C1602 405 1664 343 1740 355C1848 372 1954 482 2074 586L2074 1038C1957 977 1901 838 1838 704C1784 590 1698 532 1598 554C1494 577 1410 650 1288 630C1110 602 1005 519 835 438Z"
                />
                <path
                    fill="#ffdc70"
                    d="M842 444C984 520 1072 574 1200 600C1355 632 1453 605 1562 543C1475 617 1391 653 1280 645C1107 632 1004 531 842 444Z"
                />
                <path
                    fill="#ef6793"
                    d="M1330 540C1410 489 1467 416 1555 351C1633 293 1693 277 1757 298C1844 327 1904 376 2042 328L2042 391C1922 434 1841 391 1758 358C1681 328 1629 359 1557 414C1478 474 1414 528 1330 540Z"
                />
                <path
                    fill="#61d4bf"
                    d="M1297 548C1399 491 1457 397 1551 351C1637 309 1692 339 1743 372C1817 420 1907 400 2042 349L2042 432C1913 476 1818 463 1730 407C1677 373 1621 368 1557 399C1468 445 1408 520 1297 548Z"
                />
                <path
                    fill="#ffb348"
                    d="M1518 607C1555 635 1601 686 1638 742C1672 794 1680 821 1655 824C1627 827 1604 789 1583 738C1561 687 1535 642 1518 607Z"
                />
                <path
                    fill="#61d4bf"
                    d="M1534 609C1574 638 1615 684 1646 735C1671 777 1674 802 1652 805C1629 807 1612 775 1594 731C1575 686 1552 641 1534 609Z"
                />
            </g>
        </g>
    </svg>
</template>

<style scoped>
.product-wave-transition {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
