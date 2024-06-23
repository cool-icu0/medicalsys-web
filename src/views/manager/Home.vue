<template>
	<div>
		<div class="card" style="padding: 15px">
			<h3>您好，{{ user }}！欢迎使用</h3>
		</div>
		<div style="display: flex; margin: 10px 0">
			<div style="width: 60%; margin: auto;" class="card">
				<div style="margin-bottom: 30px; font-weight: bold">公告列表
					<el-input placeholder="请输入标题查询" style="width: 250px;margin-left: 150px;"
						v-model="searchkey"></el-input>
					<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
				</div>
				<el-table :data="topicsCompute" stripe @selection-change="handleSelectionChange">
					<el-table-column prop="topicId" label="序号" width="80" align="center" sortable></el-table-column>
					<el-table-column prop="title" label="标题" show-overflow-tooltip></el-table-column>
					<el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
					<el-table-column :formatter="formatDate" prop="createDate" label="创建时间"></el-table-column>
					<el-table-column prop="userId" label="话题创建人"></el-table-column>

					<el-table-column label="操作" width="180" align="center">
						<template v-slot="scope">
							<el-button plain type="primary" @click="details(scope.row)" size="mini">详情</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
						:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next"
						:total="total">
					</el-pagination>
				</div>
				<el-dialog  
				        title="话题详情"  
				        :visible.sync="dialogVisible"  
				        width="50%"  
				        :before-close="handleDialogClose"  
				    > 
					<div style="padding: 20px;">
						<div>
							<h3>{{ form.title }}</h3>
						</div>
						<div v-html="form.content" style="margin-top: 20px;" class="content-with-border">
						</div>
					</div>
					<div>
						<hr>
					</div>
					<el-form :model="replyForm" ref="replyFormRef" label-width="100px"
						style="margin-top: 20px;padding-right: 50px">
						<el-form-item label="评论内容">
							<el-input type="textarea" rows="4" v-model="replyForm.content"
								placeholder="请输入评论内容"></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="submitReply">发布评论</el-button>
						</el-form-item>
					</el-form>
					<!-- 评论表格 -->
					<div v-if="comments.length > 0" style="margin-top: 20px; padding: 10px;"> <!-- v-if当有评论时才显示表格 -->
						<h4>评论：</h4><br />
						<el-table :data="comments" stripe style="width: 100%">
							<el-table-column prop="userId" label="评论者"></el-table-column>
							<el-table-column prop="content" label="评论内容"></el-table-column>
							<el-table-column :formatter="formatDate" prop="replyDate" label="评论时间"></el-table-column>
						</el-table>
					</div>
				</el-dialog>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Home',
		data() {
			return {
				nowDate: null,
				nowtimer: "",
				pageNum: 1,
				pageSize: 8,
				searchkey: '',
				total: 0,
				direction: 'rtl',
				dialogVisible: false,
				form: {},
				replyForm: {
					content: ''
				},
				user: JSON.parse(localStorage.getItem('xm-user')).username,
				userid: JSON.parse(localStorage.getItem('xm-user')).userId,
				currentTopicId: null, // 当前话题ID，在details方法中设置
				notices: [], // 话题数据
				comments: [], // 当前话题的评论
			}
		},
		mounted() {
			this.fetchTopic();
		},
		created() {
			this.load(1)
		},
		computed: {
			topicsCompute: function() {
				return this.notices.filter(item => {
					return item.title.includes(this.searchkey)
				})
			}
		},
		methods: {
			fetchTopic() {
				this.$request.get(`/api/v1/topic/allTopicPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.notices = res.data?.list
						this.total = res.data?.total
					})
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/topic/allTopicPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
						title: this.title,
					}
				}).then(res => {
					console.log(res)
					this.notices = res.data?.list
					this.total = res.data?.total
				})
			},
			reset() {
				this.searchkey = ""
			},
			details(row) {
				this.dialogVisible = true
				this.form = JSON.parse(JSON.stringify(row))
			},
			handleDialogClose(done) {
				this.$confirm('确认关闭？')
					.then(_ => {
						done();
					})
					.catch(_ => {});
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			formatDate(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "2024-05-15"
			},
			gettime() {
				const now = new Date();
				const year = now.getFullYear(); // 获取四位数年份
				const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1，并确保两位数
				const day = now.getDate().toString().padStart(2, '0'); // 确保天为两位数

				this.nowDate = `${year}-${month}-${day}`; //T${hours}:${minutes}:${seconds}.${milliseconds}+08:00
			},
			details(row) {
				this.dialogVisible = true;
				this.form = JSON.parse(JSON.stringify(row));
				this.currentTopicId = row.topicId; // 设置当前话题ID  
				this.userId = row.userId;
				this.fetchComments(this.currentTopicId); // 获取当前话题的评论 
			},
			submitReply() {
				// 收集评论数据  
				const replyData = {
					replyId: this.userid,
					topicId: this.currentTopicId,
					userId: this.userId,
					content: this.replyForm.content,
					replyDate: this.nowDate,
					// timestamp: new Date().getTime(), // 例如，添加当前时间戳  
				};

				// 发送评论数据到服务器  
				this.$request.post('/api/v1/reply/insertReply', replyData)
					.then(response => {
						// 处理响应数据，例如显示成功消息或更新评论列表等  
						this.$message.success('评论发布成功！');
						this.replyForm.content = ''; // 清空评论框  
						this.fetchComments(this.currentTopicId); //添加完拉取
					})
					.catch(error => {
						// 处理错误情况，例如显示错误消息等  
						this.$message.error('评论发布失败！');
						console.error(error);
					});
			},
			fetchComments(topicId) {
				this.$request.get(`/api/v1/reply/selectReplyByTopicId/${topicId}`)
					.then(res => {
						this.comments = res.data || [];
					})
					.catch(error => {
						console.error('Failed to fetch comments:', error);
					});
			},
		}
	}
</script>
<style scoped>
	.content-with-border {
		padding: 10px;
		border: 1px solid #ccc;
		min-width: 100px;
		/* 设置最小宽度 */
		min-height: 200px;
		overflow-x: auto;
		overflow-y: auto;
		/* 当内容垂直溢出时显示滚动条 */
	}
</style>