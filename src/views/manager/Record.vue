<template>
	<div>
		<div class="search" style="margin-bottom: 10px;">
			<el-input placeholder="请输入ID查询" style="width: 200px; margin-right: 20px;" v-model="SearchKey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<el-button type="primary" plain style="margin-left: 10px" @click="handleAdd()">新增</el-button>
		</div>
		<div class="card">
			<el-table :data="PatientTrackingCompute" style="width: 100%" @sort-change="handleSortChange">
				<el-table-column prop="id" label="序号"></el-table-column>
				<el-table-column prop="userId" label="用户ID" sortable></el-table-column>
				<el-table-column :formatter="formatDate" prop="trackingDate" label="追踪日期"></el-table-column>
				<el-table-column prop="isRecovery" label="是否康复" :formatter="formatRecoveryStatus"></el-table-column>
				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
				<el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false"
					destroy-on-close>
					<el-form label-width="100px" style="padding-right: 20px" :model="form" :rules="rules" ref="formRef">
						<el-row :gutter="10">
							<el-col :span="12">
								<div><el-form-item prop="userId" label="用户ID"
										:rules="form.id !== 0 ? rules.userId : []">
										<el-input v-model="form.userId" autocomplete="off"
											:disabled="form.id !== 0"></el-input>
									</el-form-item></div>
							</el-col>
							<el-col :span="12">
								<div><el-form-item prop="isRecovery" label="是否痊愈" :rules="rules.isRecovery">
										<el-select v-model="form.isRecovery" placeholder="请选择">
											<el-option label="已康复" value="1"></el-option>
											<el-option label="未痊愈" value="0"></el-option>
										</el-select>
									</el-form-item></div>
							</el-col>
						</el-row>
						<el-form-item prop="trackingDate" label="追踪日期" :rules="rules.trackingDate">
							<el-date-picker v-model="form.trackingDate" type="date" placeholder="选择日期"></el-date-picker>
						</el-form-item>
					</el-form>
					<div slot="footer" class="dialog-footer">
						<el-button @click="fromVisible = false">取 消</el-button>
						<el-button type="primary" @click="save">确 定</el-button>
					</div>
				</el-dialog>
			</div>
		</div>
	</div>

</template>

<script>
	export default {
		data() {
			return {
				nowDate: null,
				tableData: [],
				SearchKey: '',
				pageNum: 1,
				pageSize: 8,
				total: 0, // 添加 total 属性
				fromVisible: false,
				form: {},
				formatRecoveryStatus(row, column) {
					return row.isRecovery === 1 ? '已康复' : '未痊愈';
				},
				rules: {
					userId: [{
						required: true,
						message: '用户ID不能为空',
						trigger: 'blur'
					}, ],
					isRecovery: [{
						required: true,
						message: '请选择是否痊愈',
						trigger: 'change'
					}, ],
					trackingDate: [{
						required: true,
						message: '追踪日期不能为空',
						trigger: 'change'
					}, ],
					// 如果还有其他字段，也在这里添加对应的规则  
				},
			}
		},
		computed: {
			PatientTrackingCompute: function() {
				if (this.tableData.length > 0) {
					return this.tableData.filter(item => {
						return ("" + item.userId).includes(this.SearchKey)
					})
				} else {
					return []
				}
			}
		},
		mounted() {
			this.fetchPatientTracking();
			this.loadDoctor();
		},
		methods: {
			fetchPatientTracking() {
				this.$request.get(
						`/api/v1/patientTrack/allPatientTrackingPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.tableData = res.data?.list
						this.total = res.data?.total
					})
			},
			handleAdd() {
				this.form = {
					id: 0
				}
				this.fromVisible = true
			},
			handleEdit(row) {
				this.fromVisible = true
				this.form = JSON.parse(JSON.stringify(row))

			},
			save() {
				this.$refs.formRef.validate(async valid => {
					if (valid) {
						this.$request({
							url: this.form.id ? '/api/v1/patientTrack/updatePatientTracking' :
								'/api/v1/patientTrack/insertPatientTracking',
							method: 'POST',
							data: this.form
						}).then(res => {
							if (res.code == 200) { // 表示成功保存
								this.$message.success('保存成功')
								this.fetchPatientTracking()
								this.fromVisible = false
							} else {
								this.$message.error(res.msg) // 弹出错误的信息
							}
						})
					}
				})
			},
			reset() {
				this.SearchKey = ''
			},
			gettime() {
				const now = new Date();
				const year = now.getFullYear(); // 获取四位数年份
				const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1，并确保两位数
				const day = now.getDate().toString().padStart(2, '0'); // 确保天为两位数
				this.nowDate = `${year}-${month}-${day}`; //T${hours}:${minutes}:${seconds}.${milliseconds}+08:00
			},
			formatDate(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "xxxx-xx-xx"
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/mediHistory/allWaterFreePager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
		}
	}
</script>

<style>
</style>