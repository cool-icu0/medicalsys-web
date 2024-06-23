<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入用户ID查询" style="width: 200px;margin-right: 20px;"
				v-model="userSearchKey"></el-input>
			<el-input placeholder="请输入医生ID查询" style="width: 200px" v-model="doctorSearchKey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
		</div>

		<div class="table">
			<el-table :data="reserveCompute" stripe>
				<!-- <el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column> -->
				<el-table-column prop="userId" label="患者ID" width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="doctorId" label="医生ID" show-overflow-tooltip></el-table-column>
				<el-table-column prop="hospitalDepartment" label="科室" show-overflow-tooltip></el-table-column>
				<el-table-column :formatter="formatDate" prop="appointmentDate" label="挂号时间"></el-table-column>
				<el-table-column prop="appPrices" label="支付费用"></el-table-column>

				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button v-if="scope.row.isComplete !== 1" type="primary" size="mini"
							@click="agree(scope.row)">受理</el-button>
						<el-button v-else type="success" size="mini" disabled>已受理</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "Reserve",
		data() {
			return {
				nowDate: null,
				nowtimer: "",
				userSearchKey: '',
				doctorSearchKey: '',
				tableData: [], // 所有的数据
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				status: null,
				fromVisible: false,
				form: {},
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				rules: {},
				ids: [],
				formData: { //受理表单
					id: null,
					userId: '',
					doctorId: '',
					hospitalDepartment: '',
					appointmentDate: '',
					appPrices: 0,
					isComplete: 0,
				},
			}
		},
		mounted() {
			this.fetchReserve();
		},
		computed: {
			reserveCompute: function() {
				return this.tableData.filter(item => {
						return ("" + item.doctorId).includes(this.doctorSearchKey)
					})
					.filter(item => {
						return ("" + item.userId).includes(this.userSearchKey)
					})
			}
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
			gettime() {
				const now = new Date();
				const year = now.getFullYear(); // 获取四位数年份
				const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1，并确保两位数
				const day = now.getDate().toString().padStart(2, '0'); // 确保天为两位数

				this.nowDate = `${year}-${month}-${day}`; //T${hours}:${minutes}:${seconds}.${milliseconds}+08:00
			},
			load(pageNum) { // 分页查询  
				if (pageNum) this.pageNum = pageNum
				this.$request.get(
					`/api/v1/appoint/allAppointmentRegistrationPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}&doctorId=${this.doctorSearchKey}&userId=${this.userSearchKey}`
				).then(res => {
					this.tableData = res.data?.list || []; // 确保list始终是一个数组  
					this.total = res.data?.total || 0; // 确保total始终是一个数字  
				}).catch(error => {
					console.error('加载分页数据失败:', error);
				});
			},
			reset() {
				this.userSearchKey = ''
				this.doctorSearchKey = ''
			},
			// 用于处理医生受理操作，async/await允许以同步的方式编写异步代码
			async agree(row) {
				try {
					// 调用getComplete方法，异步获取用户的受理信息  
					const completeData = await this.getComplete(row.userId);
					this.formData = {
						appPrices: row.appPrices, // 价格  
						appointmentDate: row.appointmentDate, // 预约日期  
						doctorId: row.doctorId, // 医生ID  
						hospitalDepartment: row.hospitalDepartment, // 医院科室  
						id: row.id,
						userId: row.userId, // 用户ID  
						isComplete: completeData[0].isComplete, // 是否受理  
					};

					const response = await this.$request.post('/api/v1/appoint/authorize', this.formData);
					// 后端响应数据
					console.log(response.data);
					if (response.code === 200) {
						// 更新当前行的isComplete状态  
						const index = this.tableData.findIndex(item => item.id === row.id);
						// 数组的findIndex方法用来查找tableData数组中id属性与当前行row.id相等的元素的索引
						//如果找到了匹配的元素，index将存储该元素的索引；如果没有找到，index将存储-1
						if (index !== -1) { //不等于-1，说明在tableData数组中找到了对应的行
							this.$set(this.tableData[index], 'isComplete', 1);
							//使用$set实例方法来更新tableData数组中指定索引处的对象的isComplete属性。
							//$set确保属性更新能够触发视图重新渲染。将isComplete属性设置为1，表示该行数据已经被处理或受理
						}
					}
				} catch (error) {
					console.error('获取受理信息或发送请求失败:', error);
					this.formData = {
						...this.formData, // 使用现有的formData数据  
						isComplete: 0 // 并设置isComplete为默认值0  
					};

				}
			},
			getComplete(userId) { // 查询受理值
				// 使用Promise.resolve来包装this.$request.get的返回值，确保getPrice返回一个Promise  
				return new Promise((resolve, reject) => {
					// 使用模板字符串替换来构造URL  
					const url = `/api/v1/appoint/selectAppointmentRegistrationByUserId/` + userId;
					this.$request.get(url)
						.then(response => {
							resolve(response.data); // 使用resolve来返回数据  
						}).catch(error => {
							console.error('查询受理情况:', error); // 添加错误处理  
							reject(error); // 使用reject来传递错误  
						});
				});
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
		}
	}
</script>

<style scoped>

</style>