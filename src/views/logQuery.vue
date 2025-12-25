<template>
    <div class="main-page">
        <div class="search-area">
            <div class="search-item">订单编号：<Input class="item-input" v-model="orderNumber" placeholder="订单编号" maxlength="50" clearable @on-keyup="keyupfun"/></div>
            <Button icon="ios-search" type="primary" class="search-btn" @click="search()">搜索</Button>
        </div>
        <div class="table-item">
            <Table stripe border :columns='columns' :data='dataList'>
            </Table>
        </div>
    </div>
</template>

<script>
    import roleList from '../libs/roleList.js';
    export default {
        data() {
            return {
                columns: [
                    {
                        type: 'index',
                        title: '序号',
                        width: 70,
                        align: 'center',
                    },
                    {
                        title: '订单编号',
                        minWidth: 200,
                        key: 'orderNumber'
                    },
                    {
                        title: '执行人员',
                        key: 'operatorName',
                        width: 150
                    },
                    {
                        title: '执行时间',
                        key: 'createDateTime',
                        width: 175,
                    },
                    {
                        title: '角色',
                        key: 'operatorRoleName',
                        width: 150
                    },
                    {
                        title: '账号',
                        key: 'operatorAccount',
                        width: 150
                    },
                    {
                        title: '操作',
                        width: 150,
                        key: 'action'
                    },
                ],
                dataList: [],
                orderNumber: '',
            }
        },
        methods: {
            search(){
                this.pageIndex = 1;
                this.queryLog();
            },
            keyupfun(e){
                if (e.keyCode === 13) {
                    this.search();
                }
            },
            queryLog(){
                let _this = this;
                let _param = {
                    "orderNumber": _this.orderNumber
                };
                _this.showLoading();
                _this.axios.queryLog(_param).then(data => {
                    _this.hideLoading();
                    if (data.errcode === '0') {
                        if (data.result) {
                            _this.dataList = [];
                            data.result.forEach(dataItem => {
                                let _createDate = dataItem.createDate.replace(/-/g,'/').replace('T', ' ').replace(/[.]\d*[+]\d*/g, '');
                                var _item = {
                                    orderNumber: dataItem.orderNumber,
                                    operatorName: dataItem.operatorName,
                                    operatorRoleName: dataItem.operatorRoleName,
                                    operatorAccount: dataItem.operatorAccount,
                                    action: dataItem.action,
                                    createDateTime: _createDate,
                                }
                                _this.dataList.push(_item);
                            });
                        }
                        _this.totalCount = data.result.total;
                    } else {
                        _this.$Modal.error({
                            'title': '获取失败',
                            'content': `根据订单号：${_this.orderNumber}获取订单操作日志列表失败`
                        });
                    }
                }).catch(error => {
                    _this.hideLoading();
                    _this.$Modal.error({
                        'title': '获取失败',
                        'content': `根据订单号：${_this.orderNumber}获取订单操作日志列表失败`
                    });
                });
            },
        },
        mounted() {
            this.queryLog();
        },
    }
</script>

<style lang="less" scoped>
    .main-page{
        width: 100%;
        overflow: auto;
        .search-area {
            margin:10px 0 20px 0;
            display: inline-block;
            .search-item {
                display: inline-block;
                margin-left: 10px;
                .item-input {
                    display: inline-block;
                    width: 200px;
                    &.select-input{
                        width: 80px;
                    }
                }
            }
            .search-btn {
                margin-left: 20px;
            }
            .add-btn {
                margin-left: 20px;
            }
        }
        .table-item {
            width: calc(~'100%' - 15px);
            margin:0px 10px 0 5px;
        }
        .page-item{
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
    }

    .modify-password-panel {
        .modify-password-main {
            display: flex;
            align-items: center;
            justify-content: center;
            .modify-password-title {
                width: 40px;
            }
            .modify-password-input {
                @calcWidth: 40px;
                width: calc(~'100%' - @calcWidth);
            }
        }
    }
</style>