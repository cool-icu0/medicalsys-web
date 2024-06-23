<template>
	<div>
		<div class="card" style="padding: 15px;margin-bottom: 10px;">
			<h3>您好，{{ user }}！欢迎进入聊天室</h3>
		</div>
		<el-row :gutter="10">
			<el-col :span="8">
				<div class="card">
					<div style="margin-bottom: 30px; font-weight: bold">当前预约
					</div>
					<el-table :data="tableData" stripe>
						<el-table-column prop="userId" label="患者ID" width="80" show-overflow-tooltip></el-table-column>
						<el-table-column :formatter="formatDate" prop="appointmentDate" label="挂号时间"></el-table-column>
						<el-table-column label="操作" width="180" align="center">
							<template v-slot="scope">
								<el-button v-if="scope.row.isComplete !== 1" type="primary" size="mini"
									@click="agree(scope.row)">受理</el-button>
								<el-button v-else type="success" size="mini" disabled>已结束</el-button>
							</template>
						</el-table-column>
						<!-- <div class="pagination">
							<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
								:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
							</el-pagination>
						</div> -->
					</el-table>
				</div>
			</el-col>
			<el-col :span="16">
				<div>
					<div style="width: 100%; margin: auto;" class="card">
						<div style="margin-bottom: 30px; font-weight: bold">聊天框
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
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
				tableData:[],
				form: {},
				user: JSON.parse(localStorage.getItem('xm-user')).username,
				userid: JSON.parse(localStorage.getItem('xm-user')).userId,
			}
		},
		mounted() {
			this.fetchReserve();
		},
		computed: {
		},
		methods: {
			fetchReserve() {
				this.$request.get(
					`/api/v1/appoint/allAppointmentRegistrationPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`
				).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
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
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/appoint/selectAppointmentRegistrationByDoctorId/{doctorid}', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					console.log(res)
					this.notices = res.data?.list
					this.total = res.data?.total
				})
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